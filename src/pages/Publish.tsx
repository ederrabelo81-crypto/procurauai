import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Check } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { cn } from '@/lib/utils';
import type { CategoryIconKey } from '@/data/mockData';

type PublishType = 'bazar' | 'evento' | 'oferta' | 'comercio' | 'carro' | 'emprego' | 'imovel';

interface FormData {
  type: PublishType | null;
  title: string;
  description: string;
  category: string;
  neighborhood: string;
  price: string;
  photos: string[];
  whatsapp: string;
  phone: string;
}

const DRAFT_KEY = 'monte-de-tudo-draft';

const publishTypes: { id: PublishType; iconKey: CategoryIconKey; shortLabel: string; label: string; description: string }[] = [
  { id: 'bazar', iconKey: 'classifieds', shortLabel: 'Bazar', label: 'Bazar / Classificado', description: 'Vender ou doar algo' },
  { id: 'evento', iconKey: 'events', shortLabel: 'Evento', label: 'Evento', description: 'Divulgar um evento' },
  { id: 'oferta', iconKey: 'deals', shortLabel: 'Oferta', label: 'Oferta', description: 'Promoção do seu negócio' },
  { id: 'comercio', iconKey: 'store', shortLabel: 'Negócio', label: 'Comércio / Serviço', description: 'Cadastrar seu negócio' },
  { id: 'carro', iconKey: 'cars', shortLabel: 'Carro', label: 'Carro', description: 'Anunciar veículo' },
  { id: 'emprego', iconKey: 'jobs', shortLabel: 'Emprego', label: 'Vaga de Emprego', description: 'Publicar vaga' },
  { id: 'imovel', iconKey: 'realestate', shortLabel: 'Imóvel', label: 'Imóvel', description: 'Alugar ou vender imóvel' },
];

const categories: Record<PublishType, string[]> = {
  bazar: ['Eletrônicos', 'Móveis', 'Roupas', 'Veículos', 'Pets', 'Outros'],
  evento: ['Festa', 'Show', 'Esportes', 'Religioso', 'Cultural', 'Outros'],
  oferta: ['Alimentação', 'Beleza', 'Serviços', 'Varejo', 'Outros'],
  comercio: ['Alimentação', 'Beleza', 'Saúde', 'Serviços', 'Varejo', 'Pets', 'Outros'],
  carro: ['Sedan', 'SUV', 'Hatch', 'Pickup', 'Moto', 'Outros'],
  emprego: ['CLT', 'PJ', 'Estágio', 'Freelancer', 'Temporário', 'Outros'],
  imovel: ['Apartamento', 'Casa', 'Kitnet', 'Terreno', 'Comercial', 'Outros'],
};

const neighborhoods = ['Centro', 'Vila Nova', 'Jardim América', 'Industrial', 'Outro'];

export default function Publish() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : {
        type: null,
        title: '',
        description: '',
        category: '',
        neighborhood: '',
        price: '',
        photos: [],
        whatsapp: '',
        phone: '',
      };
    } catch {
      return {
        type: null,
        title: '',
        description: '',
        category: '',
        neighborhood: '',
        price: '',
        photos: [],
        whatsapp: '',
        phone: '',
      };
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Salvar rascunho
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  const canProceed = () => {
    switch (step) {
      case 1: return formData.type !== null;
      case 2: return formData.title.trim() && formData.category && formData.neighborhood;
      case 3: return true; // Fotos são opcionais
      case 4: return formData.whatsapp.trim().length >= 10;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 4 && canProceed()) {
      setStep(step + 1);
    } else if (step === 4 && canProceed()) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simula envio
    await new Promise(resolve => setTimeout(resolve, 1500));
    localStorage.removeItem(DRAFT_KEY);
    setIsSubmitting(false);
    setIsComplete(true);
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-status-open/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
            <Check className="w-10 h-10 text-status-open" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Enviado!</h1>
          <p className="text-muted-foreground mb-6">
            Seu anúncio vai passar por uma olhadinha antes de aparecer.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">Publicar</h1>
              <p className="text-xs text-muted-foreground">Passo {step} de 4</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="flex gap-1.5 mt-3">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  s <= step ? "bg-primary" : "bg-border"
                )}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Step 1: Tipo */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Prompt vendedor */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-foreground mb-2">
                Publique seu anúncio e comece a receber clientes agora
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Escolha a categoria certa, descreva seu negócio com clareza e apareça para pessoas que já estão procurando exatamente o que você oferece.
              </p>
              <p className="text-xs text-primary font-medium mt-3 flex items-center gap-1.5">
                <span>💡</span>
                Quanto mais completo o anúncio, maiores as chances de destaque e contato.
              </p>
            </div>

            <h3 className="text-base font-semibold text-foreground">O que você quer publicar?</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {publishTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => updateField('type', type.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 bg-card rounded-2xl card-shadow text-center transition-all active:scale-98",
                    formData.type === type.id && "ring-2 ring-primary bg-primary/5"
                  )}
                >
                  <CategoryIcon categoryId={type.iconKey} size="md" />
                  <p className="text-[12px] font-semibold text-foreground leading-tight">
                    {type.shortLabel}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Informações */}
        {step === 2 && formData.type && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-foreground">Informações básicas</h2>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Ex: iPhone 12 seminovo"
                className="w-full h-12 px-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição curta</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Descreva em poucas palavras..."
                rows={3}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Categoria</label>
              <div className="flex flex-wrap gap-2">
                {categories[formData.type].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateField('category', cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      formData.category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Bairro</label>
              <div className="flex flex-wrap gap-2">
                {neighborhoods.map((n) => (
                  <button
                    key={n}
                    onClick={() => updateField('neighborhood', n)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      formData.neighborhood === n
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {(formData.type === 'bazar' || formData.type === 'carro' || formData.type === 'imovel') && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Preço {formData.type === 'bazar' && '(opcional)'}
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder={
                    formData.type === 'bazar' 
                      ? "R$ 0,00 (deixe vazio se for doação)" 
                      : formData.type === 'imovel'
                        ? "R$ 0,00 (ou valor do aluguel)"
                        : "R$ 0,00"
                  }
                  className="w-full h-12 px-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Fotos */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-foreground">Adicione fotos</h2>
            <p className="text-muted-foreground">Até 6 fotos (opcional)</p>
            
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <button
                  key={i}
                  className="aspect-square bg-card border-2 border-dashed border-border rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors"
                >
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </button>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              📷 Em breve: upload de fotos
            </p>
          </div>
        )}

        {/* Step 4: Contato */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-foreground">Como entrar em contato?</h2>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                WhatsApp <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value.replace(/\D/g, ''))}
                placeholder="31999999999"
                className="w-full h-12 px-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">Apenas números, com DDD</p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Telefone (opcional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                placeholder="3199999999"
                className="w-full h-12 px-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer com botão */}
      <div className="fixed bottom-16 left-0 right-0 z-50 bg-card border-t border-border p-4 safe-bottom">
        <button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className={cn(
            "w-full h-14 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all",
            canProceed() && !isSubmitting
              ? "bg-primary text-primary-foreground active:scale-98"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Enviando...
            </>
          ) : step === 4 ? (
            <>
              Publicar
              <Check className="w-5 h-5" />
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
