import { supabase } from "@/lib/supabaseClient";

async function checkDatabaseContent() {
  console.log("Verificando conteúdo do banco de dados...");

  // Verificar todas as categorias possíveis
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('businesses')
    .select('category, category_slug')
    .limit(100);

  if (categoriesError) {
    console.error('Erro ao buscar categorias:', categoriesError);
  } else {
    console.log('\nTodas as categorias encontradas:');
    const categoryCounts: Record<string, number> = {};
    categoriesData.forEach(item => {
      const cat = item.category || 'null';
      const slug = item.category_slug || 'null';
      if (!categoryCounts[`${cat} (${slug})`]) {
        categoryCounts[`${cat} (${slug})`] = 0;
      }
      categoryCounts[`${cat} (${slug})`]++;
    });
    
    Object.entries(categoryCounts).forEach(([key, count]) => {
      console.log(`${key}: ${count}`);
    });
  }

  // Verificar especificamente por entradas com "comer-agora"
  const { data: comerAgoraData, error: comerAgoraError } = await supabase
    .from('businesses')
    .select('*')
    .eq('category_slug', 'comer-agora')
    .limit(20);

  if (comerAgoraError) {
    console.error('Erro ao buscar dados de comer-agora:', comerAgoraError);
  } else {
    console.log(`\nEncontrados ${comerAgoraData.length} estabelecimentos com category_slug 'comer-agora':`);
    comerAgoraData.forEach(item => {
      console.log(`- ${item.name} (${item.category}) - ${item.neighborhood}`);
    });
  }

  // Verificar entradas com categorias de comida (usando palavras-chave)
  const foodKeywords = ['restaurante', 'lanchonete', 'pizzaria', 'hamburguer', 'bar', 'cafe', 'caf', 'padaria', 'panificadora', 'confeitaria', 'gastro', 'sorveteria'];
  
  const { data: foodData, error: foodError } = await supabase
    .from('businesses')
    .select('*')
    .or(
      foodKeywords.map(keyword => `name.ilike.%${keyword}%,category.ilike.%${keyword}%`).join(',')
    )
    .limit(20);

  if (foodError) {
    console.error('Erro ao buscar dados de comida:', foodError);
  } else {
    console.log(`\nEncontrados ${foodData.length} estabelecimentos com palavras-chave de comida:`);
    foodData.forEach(item => {
      console.log(`- ${item.name} (${item.category}) - ${item.neighborhood} - Slug: ${item.category_slug}`);
    });
  }

  // Verificar entradas com "servicos"
  const { data: servicosData, error: servicosError } = await supabase
    .from('businesses')
    .select('*')
    .eq('category_slug', 'servicos')
    .limit(20);

  if (servicosError) {
    console.error('Erro ao buscar dados de serviços:', servicosError);
  } else {
    console.log(`\nEncontrados ${servicosData.length} estabelecimentos com category_slug 'servicos':`);
    servicosData.forEach(item => {
      console.log(`- ${item.name} (${item.category}) - ${item.neighborhood}`);
    });
  }
}

// Executar a verificação
checkDatabaseContent()
  .then(() => console.log('\nVerificação concluída.'))
  .catch(err => console.error('Erro na verificação:', err));