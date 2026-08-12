import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Check, AlertCircle } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { cn } from '@/lib/utils';
import type { CategoryIconKey } from '@/data/mockData';
import { LISTING_TYPES, getCategoriesForType } from '@/lib/taxonomy';

type PublishType = 'classificados' | 'agenda' | 'ofertas' | 'negocios' | 'carros' | 'empregos' | 'imoveis' | 'servicos';

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

interface ValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  neighborhood?: string;
  price?: string;
  whatsapp?: string;
}

const DRAFT_KEY = 'procura-uai-draft';

// Mapeamento de PublishType para ID da taxonomia e iconKey
const publishTypes: { id: PublishType; taxonomyId: string; iconKey: CategoryIconKey; shortLabel: string; label: string; description: string }[] = [
  { id: 'classificados', taxonomyId: 'classificados', iconKey: 'classifieds', shortLabel: 'Classificados', label: 'Classificados', description: 'Vender ou doar algo' },
  { id: 'agenda', taxonomyId: 'agenda', iconKey: 'events', shortLabel: 'Evento', label: 'Evento', description: 'Divulgar um evento' },
  { id: 'ofertas', taxonomyId: 'ofertas', iconKey: 'deals', shortLabel: 'Oferta', label: 'Oferta', description: 'Promoção do seu negócio' },
  { id: 'negocios', taxonomyId: 'negocios', iconKey: 'store', shortLabel: 'Negócio', label: 'Comércio / Serviço', description: 'Cadastrar seu negócio' },
  { id: 'carros', taxonomyId: 'carros', iconKey: 'cars', shortLabel: 'Carros', label: 'Carros', description: 'Anunciar veículo' },
  { id: 'empregos', taxonomyId: 'empregos', iconKey: 'jobs', shortLabel: 'Emprego', label: 'Vaga de Emprego', description: 'Publicar vaga' },
  { id: 'imoveis', taxonomyId: 'imoveis', iconKey: 'realestate', shortLabel: 'Imóvel', label: 'Imóvel', description: 'Alugar ou vender imóvel' },
  { id: 'servicos', taxonomyId: 'servicos', iconKey: 'services', shortLabel: 'Serviços', label: 'Serviços', description: 'Oferecer um serviço' },
];

// Função para obter categorias do tipo selecionado a partir da taxonomia
const getCategoriesForPublishType = (type: PublishType): string[] => {
  const publishType = publishTypes.find(p => p.id === type);
  if (!publishType) return ['Outros'];
  
  const categories = getCategoriesForType(publishType.taxonomyId);
  if (categories.length === 0) return ['Outros'];
  return [...categories, 'Outros'];
};

const neighborhoods = ['Centro', 'Vila Nova', 'Jardim América', 'Industrial', 'Outro'];

// Validação em tempo real
function validateField(field: keyof FormData, value: string, formData: FormData): string | undefined {
  switch (field) {
    case 'title':
      if (!value.trim()) return 'O título é obrigatório';
      if (value.length < 5) return 'O título deve ter pelo menos 5 caracteres';
      if (value.length > 100) return 'O título deve ter no máximo 100 caracteres';
      return undefined;
    
    case 'description':
      if (value.length > 500) return 'A descrição deve ter no máximo 500 caracteres';
      return undefined;
    
    case 'price':
      if (value && !/^[\d.,\s]+$/.test(value.replace('R$', '').trim())) {
        return 'Digite apenas números';
      }
      return undefined;
    
    case 'whatsapp':
      if (!value.trim()) return 'WhatsApp é obrigatório';
      if (value.length < 10) return 'Digite um número válido com DDD';
      if (value.length > 11) return 'Número muito longo';
      return undefined;
    
    case 'phone':
      if (value && value.length < 10) return 'Digite um número válido';
      return undefined;
    
    default:
      return undefined;
  }
}

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
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Salvar rascunho
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  // Validação em tempo real
  const validateForm = (data: FormData): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    if (step === 2) {
      const titleError = validateField('title', data.title, data);
      if (titleError) newErrors.title = titleError;
      
      if (!data.category) newErrors.category = 'Selecione uma categoria';
      if (!data.neighborhood) newErrors.neighborhood = 'Selecione um bairro';
      
      const priceError = validateField('price', data.price, data);
      if (priceError) newErrors.price = priceError;
    }
    
    if (step === 4) {
      const whatsappError = validateField('whatsapp', data.whatsapp, data);
      if (whatsappError) newErrors.whatsapp = whatsappError;
    }
    
    return newErrors;
  };

  const canProceed = () => {
    const currentErrors = validateForm(formData);
    
    switch (step) {
      case 1: return formData.type !== null;
      case 2: return formData.title.trim() && formData.category && formData.neighborhood && !currentErrors.title && !currentErrors.price;
      case 3: return true;
      case 4: return formData.whatsapp.trim().length >= 10 && !currentErrors.whatsapp;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 4 && canProceed()) {
      setStep(step + 1);
      setTouched({});
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    localStorage.removeItem(DRAFT_KEY);
    setIsSubmitting(false);
    setIsComplete(true);
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validação em tempo real
    if (touched[field]) {
      const error = validateField(field, value, { ...formData, [field]: value });
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field] as string, formData);
    setErrors(prev => ({ ...prev, [field]: error }));
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
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg button-shadow active:scale-95 transition-transform"
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
                  "h-1.5 flex-1 rounded-full transition-colors",
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
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
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
            <div className="grid grid-cols-4 gap-2">
              {publishTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => updateField('type', type.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-3 almanac-card text-center transition-all active:scale-95",
                    formData.type === type.id && "ring-2 ring-primary bg-primary/5"
                  )}
                >
                  <CategoryIcon categoryId={type.iconKey} size="sm" />
                  <p className="text-[11px] font-semibold text-foreground leading-tight">
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
            
            {/* Título */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Título <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                placeholder="Ex: iPhone 12 seminovo"
                className={cn(
                  "w-full h-12 px-4 bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                  errors.title && touched.title 
                    ? "border-destructive focus:border-destructive" 
                    : "border-border focus:border-primary"
                )}
              />
              {errors.title && touched.title && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {formData.title.length}/100
              </p>
            </div>

            {/* Descrição */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição curta</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                onBlur={() => handleBlur('description')}
                placeholder="Descreva em poucas palavras..."
                rows={3}
                className={cn(
                  "w-full px-4 py-3 bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all",
                  errors.description && touched.description 
                    ? "border-destructive" 
                    : "border-border focus:border-primary"
                )}
              />
              {errors.description && touched.description && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {formData.description.length}/500
              </p>
            </div>

            {/* Categoria */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Categoria <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {getCategoriesForPublishType(formData.type).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateField('category', cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95",
                      formData.category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.category && touched.category && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Bairro */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Bairro <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {neighborhoods.map((n) => (
                  <button
                    key={n}
                    onClick={() => updateField('neighborhood', n)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95",
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

            {/* Preço condicional */}
            {(formData.type === 'classificados' || formData.type === 'carros' || formData.type === 'imoveis') && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Preço {formData.type === 'classificados' && '(opcional)'}
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  onBlur={() => handleBlur('price')}
                  placeholder={
                    formData.type === 'classificados' 
                      ? "R$ 0,00 (deixe vazio se for doação)" 
                      : formData.type === 'imoveis'
                        ? "R$ 0,00 (ou valor do aluguel)"
                        : "R$ 0,00"
                  }
                  className={cn(
                    "w-full h-12 px-4 bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                    errors.price && touched.price 
                      ? "border-destructive" 
                      : "border-border focus:border-primary"
                  )}
                />
                {errors.price && touched.price && (
                  <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.price}
                  </p>
                )}
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
                  className="aspect-square bg-card border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:bg-muted/50 hover:border-primary/50 transition-all active:scale-95"
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
                onBlur={() => handleBlur('whatsapp')}
                placeholder="31999999999"
                className={cn(
                  "w-full h-12 px-4 bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                  errors.whatsapp && touched.whatsapp 
                    ? "border-destructive" 
                    : "border-border focus:border-primary"
                )}
              />
              {errors.whatsapp && touched.whatsapp ? (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.whatsapp}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Apenas números, com DDD</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Telefone (opcional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('phone')}
                placeholder="3199999999"
                className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
            "w-full h-14 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all",
            canProceed() && !isSubmitting
              ? "bg-primary text-primary-foreground button-shadow active:scale-98"
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
