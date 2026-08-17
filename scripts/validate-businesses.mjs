#!/usr/bin/env node
/**
 * validate-businesses.mjs
 * 
 * Script para validação manual de estabelecimentos coletados via Google Places API.
 * Permite revisão em lote antes de liberar os dados no app, eliminando a necessidade
 * de consumo contínuo da API do Google.
 * 
 * Uso:
 *   node scripts/validate-businesses.mjs                    # Ver pendentes
 *   node scripts/validate-businesses.mjs --city="Guaxupé"   # Filtrar por cidade
 *   node scripts/validate-businesses.mjs --export-csv       # Exportar para CSV
 *   node scripts/validate-businesses.mjs --import-csv=data/validation/pending-2025-08-17.csv
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltam credenciais do Supabase no .env.local');
  console.error('Necessário: SUPABASE_SERVICE_ROLE_KEY (chave service_role)');
  console.error('\nConfigure no .env.local:');
  console.error('  VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse arguments
const args = process.argv.slice(2);
const cityFilter = args.find(a => a.startsWith('--city='))?.split('=')[1];
const exportCsv = args.includes('--export-csv');
const importCsvArg = args.find(a => a.startsWith('--import-csv='));
const importCsv = importCsvArg ? importCsvArg.split('=')[1] : null;
const statusFilter = args.find(a => a.startsWith('--status='))?.split('=')[1] || 'pending';
const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1]) || 50;

async function main() {
  console.log('🔍 Procurauai - Validação de Estabelecimentos\n');
  console.log('='.repeat(50));
  
  if (cityFilter) {
    console.log(`📍 Filtro: cidade = ${cityFilter}`);
  }
  console.log(`📊 Status: ${statusFilter}`);
  console.log(`📋 Limite: ${limit} registros\n`);
  
  // Importar CSV com validações
  if (importCsv) {
    await importValidations(importCsv);
    return;
  }
  
  // Buscar estabelecimentos para validação
  const { data: businesses, error } = await fetchBusinesses();
  
  if (error) {
    console.error('❌ Erro ao buscar dados:', error.message);
    process.exit(1);
  }
  
  console.log(`📊 Encontrados ${businesses.length} estabelecimentos\n`);
  
  if (businesses.length === 0) {
    console.log('✅ Nenhum estabelecimento pendente!');
    console.log('💡 Dica: Use --status=verified para ver os já validados\n');
    return;
  }
  
  // Exportar CSV para revisão offline
  if (exportCsv) {
    await exportToCSV(businesses);
    return;
  }
  
  // Modo interativo - mostrar amostra
  await showInteractivePreview(businesses);
}

async function fetchBusinesses() {
  let query = supabase
    .from('businesses')
    .select(`
      id,
      name,
      address,
      city,
      category,
      category_slug,
      phone,
      whatsapp,
      google_place_id,
      verification_status,
      data_source,
      is_verified,
      created_at
    `)
    .eq('verification_status', statusFilter)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (cityFilter) {
    query = query.eq('city', cityFilter);
  }
  
  return await query;
}

async function exportToCSV(businesses) {
  const dateStr = new Date().toISOString().split('T')[0];
  const cityPart = cityFilter ? `-${cityFilter.replace(/\s+/g, '-').toLowerCase()}` : '';
  const csvPath = path.join(process.cwd(), 'data', 'validation', `pending${cityPart}-${dateStr}.csv`);
  
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  
  const csvContent = [
    ['id', 'name', 'address', 'city', 'category', 'phone', 'whatsapp', 'google_place_id', 'action'],
    ...businesses.map(b => [
      b.id,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.address?.replace(/"/g, '""') || ''}"`,
      b.city,
      b.category,
      b.phone || '',
      b.whatsapp || '',
      b.google_place_id || '',
      'pending'
    ])
  ].map(row => row.join(',')).join('\n');
  
  fs.writeFileSync(csvPath, csvContent);
  
  console.log(`📄 CSV exportado: ${csvPath}`);
  console.log('\n💡 Como usar:');
  console.log('   1. Abra o CSV no Excel ou Google Sheets');
  console.log('   2. Edite a coluna "action" para cada estabelecimento:');
  console.log('      • verified   - Aprovar e liberar no app');
  console.log('      • rejected   - Rejeitar (não aparecerá no app)');
  console.log('      • pending    - Manter para revisão posterior');
  console.log('   3. Salve o arquivo');
  console.log(`   4. Execute: node scripts/validate-businesses.mjs --import-csv=${csvPath}\n`);
}

async function importValidations(csvPath) {
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Arquivo não encontrado: ${csvPath}`);
    process.exit(1);
  }
  
  console.log(`📥 Importando validações de ${csvPath}...\n`);
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').slice(1); // Skip header
  
  const updates = [];
  const stats = { verified: 0, rejected: 0, skipped: 0, errors: 0 };
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Parse CSV line (simple parser, assumes no commas in quoted fields)
    const parts = line.split(',').map(p => p.replace(/^"|"$/g, '').replace(/""/g, '"'));
    const [id, , , , , , , , action] = parts;
    
    if (!id || action === 'pending' || !action) {
      stats.skipped++;
      continue;
    }
    
    if (!['verified', 'rejected'].includes(action.toLowerCase())) {
      console.warn(`⚠️  Ação inválida "${action}" para ID ${id}, ignorando...`);
      stats.errors++;
      continue;
    }
    
    updates.push({
      id,
      updates: {
        verification_status: action.toLowerCase(),
        verified_at: action.toLowerCase() === 'verified' ? new Date().toISOString() : null,
        verified_by: '00000000-0000-0000-0000-000000000000', // Admin system
        is_verified: action.toLowerCase() === 'verified'
      }
    });
    
    stats[action.toLowerCase()]++;
  }
  
  if (updates.length === 0) {
    console.log('⚠️  Nenhuma validação para aplicar.\n');
    return;
  }
  
  // Batch update (em lotes de 100 para evitar timeout)
  const batchSize = 100;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('businesses')
        .update(update.updates)
        .eq('id', update.id);
      
      if (error) {
        console.error(`❌ Erro ao atualizar ${update.id}: ${error.message}`);
        stats.errors++;
      }
    }
    
    console.log(`   Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}...`);
  }
  
  console.log('\n✅ Validações aplicadas:');
  console.log(`   Verificados: ${stats.verified}`);
  console.log(`   Rejeitados: ${stats.rejected}`);
  console.log(`   Ignorados: ${stats.skipped}`);
  if (stats.errors > 0) {
    console.log(`   Erros: ${stats.errors}`);
  }
  console.log('\n💡 Dica: Execute novamente sem argumentos para ver os pendentes restantes.\n');
}

async function showInteractivePreview(businesses) {
  console.log('📋 Amostra dos primeiros estabelecimentos:\n');
  console.log('='.repeat(70));
  
  for (let i = 0; i < Math.min(10, businesses.length); i++) {
    const b = businesses[i];
    console.log(`${i + 1}. ${b.name}`);
    console.log(`   📍 ${b.address || 'Endereço não informado'} - ${b.city}`);
    console.log(`   🏷️  ${b.category} (${b.category_slug})`);
    console.log(`   📞 ${b.phone || 'Sem telefone'}`);
    console.log(`   💬 ${b.whatsapp || '⚠️  Sem WhatsApp'} ${!b.whatsapp ? '(coletar!)' : ''}`);
    console.log(`   🔗 google_place_id: ${b.google_place_id || 'N/A'}`);
    console.log(`   📊 Status: ${b.verification_status} | Fonte: ${b.data_source}`);
    console.log('='.repeat(70));
    console.log('');
  }
  
  console.log('💡 Comandos úteis:\n');
  console.log('   --export-csv              Exportar lista completa para CSV');
  console.log('   --city="Nome da Cidade"   Filtrar por cidade específica');
  console.log('   --status=verified         Ver estabelecimentos já validados');
  console.log('   --limit=100               Aumentar limite de registros\n');
  
  console.log('📝 Fluxo recomendado:\n');
  console.log('   1. Exporte: node scripts/validate-businesses.mjs --export-csv');
  console.log('   2. Revise no Excel/Sheets e adicione WhatsApps');
  console.log('   3. Importe: node scripts/validate-businesses.mjs --import-csv=...');
  console.log('   4. Repita até zerar os pendentes\n');
}

main().catch(err => {
  console.error('❌ Erro inesperado:', err.message);
  console.error(err);
  process.exit(1);
});
