"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

import Image from "next/image";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  getProductByHandle,
  getRelatedProducts,
  formatPrice,
  getDiscountedPrice,
  Product,
} from "../../../utils/products";

import { useCart } from "@/contexts/CartContext";
import { useBundle } from "@/contexts/BundleContext";
import { useUTM } from "@/contexts/UTMContext";
import "@/styles/product-parallax.css";
import { useRouter } from "next/navigation";


// Dados fake de comentários
const fakeReviews = [
  {
    id: 1,
    name: "Anna Müller",
    rating: 5,
    date: "2024-01-15",
    comment:
      "Fantastischer Duft! Die Haltbarkeit ist ausgezeichnet und sehr elegant. Sehr empfehlenswert!",
  },
  {
    id: 2,
    name: "Thomas Weber",
    rating: 4,
    date: "2024-01-10",
    comment:
      "Sehr gutes Produkt, schnelle Lieferung und gut verpackt. Der Duft ist genau wie erwartet.",
  },
  {
    id: 3,
    name: "Sarah Schmidt",
    rating: 5,
    date: "2024-01-08",
    comment:
      "Ich liebe es! Es ist jetzt mein Lieblingsparfüm. Die Qualität ist hervorragend.",
  },
  {
    id: 4,
    name: "Michael Fischer",
    rating: 4,
    date: "2024-01-05",
    comment:
      "Ausgezeichnetes Preis-Leistungs-Verhältnis. Das Parfüm hat gute Haltbarkeit und der Service war perfekt.",
  },
  {
    id: 5,
    name: "Julia Becker",
    rating: 5,
    date: "2024-01-02",
    comment:
      "Hat meine Erwartungen übertroffen! Sehr eleganter und langanhaltender Duft. Werde wieder kaufen.",
  },
];

// Calcular rating médio
const averageRating =
  fakeReviews.reduce((sum, review) => sum + review.rating, 0) /
  fakeReviews.length;
const totalReviews = fakeReviews.length;

export default function ProductPage() {
  const params = useParams();
  const handle = Array.isArray(params.handle)
    ? params.handle[0]
    : params.handle;
  const { addItem, addBundle, state } = useCart();

  const { isBundleActive, bundleSize, selectedItems, currentSlot, startBundle, selectProduct, removeProduct, clearBundle, isComplete } = useBundle();
  const { trackStoreProductViewed } = useUTM();
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [selectedPackageSize, setSelectedPackageSize] = useState<number>(1);

  // Função para adicionar produto ao carrinho
  const searchParams = useSearchParams();

  // Scroll suave para a seção de bundles ao carregar o produto, mantendo o título visível
  // Apenas rola se não for um recarregamento de página (reload)
  useEffect(() => {
    if (product) {
      // Verificar se é um reload
      const navigationEntries = typeof window !== 'undefined' ? window.performance.getEntriesByType('navigation') : [];
      const isReload = navigationEntries.length > 0 && (navigationEntries[0] as any).type === 'reload';
      
      if (isReload) return;

      const element = document.getElementById('bundle-selector');
      if (element) {
        // Pequeno delay para garantir que o DOM foi renderizado
        setTimeout(() => {
          const yOffset = -250; // Offset para deixar o título visível no topo
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          
          window.scrollTo({
            top: y,
            behavior: 'smooth'
          });
        }, 800);
      }
    }
  }, [product]);

  const handleAddToCart = async () => {


    if (!product || !handle) return;

    // Se for bundle e não estiver completo, redireciona para selecionar
    if (selectedPackageSize > 1 && !isComplete) {
      // Já estamos na página do produto, então talvez queira focar no seletor?
      // Ou ir para a home selecionar o próximo
      router.push(`/?bundleSlot=${currentSlot || 1}&returnTo=${handle}`);
      return;
    }

    // Se for bundle completo
    if (selectedPackageSize > 1 && isComplete) {
      const price = selectedPackageSize === 3 ? "49.99" : "99.99";
      addBundle({
        size: selectedPackageSize,
        price: price,
        items: selectedItems as any[]
      });
      return;
    }

    try {
      const fetchedProductId = product.id
        ? parseInt(product.id.toString().replace(/\D/g, ""), 10)
        : 0;

      // Fetch precise details from our PostgreSQL database API just to ensure we have the right IDs/Prices
      const res = await fetch(`/api/products/${fetchedProductId}`);
      if (!res.ok) {
        console.error(
          "Produto não encontrado no banco de dados:",
          fetchedProductId,
        );
        return;
      }
      const dbProduct = await res.json();

      const variantId = dbProduct.data?.variants?.[0]?.id
        ? parseInt(
            dbProduct.data.variants[0].id.toString().replace(/\D/g, ""),
            10,
          )
        : 0;

      addItem({
        handle: handle,
        variant_id: variantId,
        product_id: fetchedProductId,
        title: dbProduct.data?.title || product.title,
        price: dbProduct.price.toString(),
        image: product.images[0] || "",
      });
    } catch (err) {
      console.error("Erro ao adicionar produto", err);
    }
  };


  // Função para calcular o prazo de entrega dinâmico
  const getDeliveryTimeframe = () => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    // Adiciona 3 dias para data inicial
    startDate.setDate(today.getDate() + 3);
    // Adiciona 10 dias para data final
    endDate.setDate(today.getDate() + 10);

    // Nomes dos dias da semana em alemão
    const weekdays = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];

    // Formatar as datas
    const formatDate = (date: Date) => {
      const day = weekdays[date.getDay()];
      const dayNum = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}, ${dayNum}.${month}.${year}`;
    };

    return `${formatDate(startDate)} bis ${formatDate(endDate)}`;
  };

  useEffect(() => {
    if (handle) {
      const productData = getProductByHandle(handle);
      if (productData) {
        setProduct(productData);
        setSelectedImage(productData.images[0] || "");

        // Carregar produtos relacionados
        const related = getRelatedProducts(handle, 4);
        setRelatedProducts(related);
      }
    }
  }, [handle]);

  // Track ViewContent when product is loaded
  useEffect(() => {
    if (product) {
      trackStoreProductViewed(product as unknown as any);
    }
  }, [product, trackStoreProductViewed]);

  // Sync bundle size if active
  useEffect(() => {
    if (isBundleActive) {
      setSelectedPackageSize(bundleSize);
    }
  }, [isBundleActive, bundleSize]);


  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-medium text-gray-900 mb-2">
              Produto não encontrado
            </h1>
            <p className="text-gray-500 mb-6">
              O produto que você está procurando não existe ou foi removido.
            </p>
            <Link
              href="/products"
              className="inline-block bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Ver todos os produtos
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="parallax-container">
      {/* Seção da foto com header e breadcrumb integrados */}
      <section className="photo-section">
        {/* Header integrado na foto */}
        <div className="header-overlay">
          <Header />
        </div>

        {/* Breadcrumb sobreposto na foto */}
        <div className="breadcrumb-overlay">
          <div className="container mx-auto px-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                href="/"
                className="text-white/80 hover:text-white transition-colors"
              >
                Início
              </Link>
              <span className="text-white/60">/</span>
              <Link
                href="/products"
                className="text-white/80 hover:text-white transition-colors"
              >
                Produtos
              </Link>
              <span className="text-white/60">/</span>
              <span className="text-white font-medium">{product.title}</span>
            </nav>
          </div>
        </div>

        {/* Container das imagens */}
        <div className="product-images-container">
          <div className="max-w-2xl w-full">
            {/* Imagem principal */}
            <div className="relative aspect-square mb-4 bg-white rounded-lg">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.title}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white rounded-lg">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 bg-white transition-all ${
                      selectedImage === image
                        ? "border-white"
                        : "border-white/30"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Seção de conteúdo - Novo Layout */}
      <section className="product-content-section">
        <div
          data-testid="product-info"
          className="max-w-7xl mx-auto sm:px-6 lg:px-8"
        >
          <div data-testid="grid" className="product-cockpit">
            {/* Header do Produto - Design Correto */}
            <div className="pt-4 pb-2">
              <header
                className="product-detail-header product-cockpit__header"
                data-testid="product-detail-header"
              >
                <div className="product-detail-header__group">
                  <div className="flex-1">
                    <h1 className="text-lg px-4 font-thin mb-1">
                      {product?.metafields?.["seo.meta_title"] || product.title}
                    </h1>

                    <div className="flex px-4 items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {product.category?.name || "Duftset"}
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center -space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              width="13"
                              height="13"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-black"
                            >
                              <path
                                d="M6.89541 5.13455L6 3.22465L5.10459 5.13455L2.97747 5.45993L4.52055 7.04331L4.16935 9.19887L6 8.18573L7.83065 9.19887L7.47945 7.04331L9.02253 5.45993L6.89541 5.13455ZM10.8683 4.69576C10.993 4.71484 11.0439 4.86712 10.9558 4.95752L8.58321 7.39205L9.14164 10.8195C9.16247 10.9473 9.02692 11.0429 8.91369 10.9803L6 9.36775L3.08631 10.9803C2.97308 11.0429 2.83753 10.9473 2.85836 10.8195L3.41679 7.39205L1.04422 4.95752C0.956122 4.86712 1.00704 4.71484 1.13175 4.69576L4.40349 4.1953L5.85969 1.08924C5.91548 0.970253 6.08452 0.970253 6.14031 1.08924L7.59651 4.1953L10.8683 4.69576Z"
                                fill="currentColor"
                              />
                            </svg>
                          ))}
                        </div>
                        <span className="text-black-500 text-sm ml">0 (0)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
            </div>

            {/* Variante do Produto */}

            <div id="bundle-selector" className="product-cockpit__variant space-y-3">

              {[1, 3, 5].map((size) => (
                <div
                  key={size}
                  onClick={() => {
                    setSelectedPackageSize(size);
                    if (size > 1) {
                      startBundle(size, product as any);
                    } else {
                      clearBundle();
                    }
                  }}
                  className={`product-detail__variant product-detail__variant--style-display cursor-pointer border rounded-lg p-4 transition-all ${
                    selectedPackageSize === size
                      ? "product-detail__variant--selected border-black shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start">
                    {/* Círculo de Seleção */}
                    <div className="flex-shrink-0 mr-4 mt-1">
                      <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center ${
                        selectedPackageSize === size ? "border-black" : "border-gray-300"
                      }`}>
                        {selectedPackageSize === size && (
                          <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="product-detail__variant-name text-lg font-medium mb-1">
                            {size} {size === 1 ? 'Stück' : 'Stücke'}
                          </div>
                          <div className="product-detail__variant-row-price">
                            <div className="text-sm text-gray-600 mb-1">
                              <span
                                aria-label={`Preis ${size === 1 ? formatPrice(getDiscountedPrice(product), product.currency) : size === 3 ? '€49,99' : '€99,99'} pro ${size} Stück`}
                              >
                                {size === 1 
                                  ? `${formatPrice(getDiscountedPrice(product), product.currency)} / 1 Stück`
                                  : size === 3 
                                    ? '€49,99 / 3 Stücke'
                                    : '€99,99 / 5 Stücke'
                                }
                              </span>
                              {size === 1 && getDiscountedPrice(product) !== product.price && (
                                <span className="ml-2 text-xs line-through text-gray-400">
                                  {formatPrice(product.price, product.currency)}
                                </span>
                              )}
                              <span className="ml-2 text-xs">inkl. MwSt.</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-1xl font-thin text-black">
                            {size === 1 
                              ? (
                                <div className="flex flex-col items-end">
                                  <span>{formatPrice(getDiscountedPrice(product), product.currency)}</span>
                                  {getDiscountedPrice(product) !== product.price && (
                                    <span className="text-xs line-through text-gray-400">
                                      {formatPrice(product.price, product.currency)}
                                    </span>
                                  )}
                                </div>
                              )
                              : size === 3 
                                ? '€49,99'
                                : '€99,99'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuração do Pacote (Slots) */}
                  {selectedPackageSize === size && size > 1 && isBundleActive && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-900">
                        Konfigurieren Sie Ihre Artikel: Duft auswählen
                      </h3>
                      <div className="space-y-3">
                        {selectedItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            {/* Imagem do Produto no Slot */}
                            <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded p-1 flex-shrink-0 flex items-center justify-center">
                              {item ? (
                                <Image src={item.images[0]} alt={item.title} width={60} height={60} className="object-contain" />
                              ) : (
                                <div className="w-full h-full bg-gray-100 rounded"></div>
                              )}
                            </div>
                            
                            {/* Botão de Seleção/Edição */}
                            <div className="flex-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Se já tem item, pode querer editar. Se não, seleciona.
                                  router.push(`/?bundleSlot=${index}&returnTo=${handle}`);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded text-sm font-medium transition-colors ${
                                  item 
                                    ? "bg-gray-100 text-gray-800 hover:bg-gray-200" 
                                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                }`}
                              >
                                <div className="flex flex-col items-start">
                                  <span className="text-[10px] text-gray-500 uppercase">Duft auswählen</span>
                                  <span className="truncate max-w-[200px]">
                                    {item ? item.title.toUpperCase() : "AUSWÄHLEN"}
                                  </span>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 18l6-6-6-6" />
                                </svg>
                              </button>
                            </div>

                            {/* Botões de Ação */}
                            {item && (
                              <div className="flex gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/?bundleSlot=${index}&returnTo=${handle}`);
                                  }}
                                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                  </svg>
                                </button>
                                {item && index > 0 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeProduct(index);
                                    }}
                                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>
                                )}


                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-sm">
                      <span className="text-green-600">+95 Beauty Points</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>


            {/* Informações de Entrega */}
            <div
              className="product-delivery-info mb-6"
              data-testid="product-delivery-info"
            >
              <div className="availability-container">
                <div
                  className="availability-info-container mb-4"
                  data-testid="online-availability"
                >
                  <button
                    className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50"
                    data-testid="availability-info"
                  >
                    <div className="flex items-center gap-3">
                      <div className="status-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-green-600"
                        >
                          <path
                            d="M15 16.5C15 17.3284 15.6716 18 16.5 18C17.3284 18 18 17.3284 18 16.5C18 15.6716 17.3284 15 16.5 15C15.6716 15 15 15.6716 15 16.5ZM16.5 14C15.1193 14 14 15.1193 14 16.5C14 17.8807 15.1193 19 16.5 19C17.8807 19 19 17.8807 19 16.5C19 15.1193 17.8807 14 16.5 14Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                          <path
                            d="M5 16.5C5 17.3284 5.67157 18 6.5 18C7.32843 18 8 17.3284 8 16.5C8 15.6716 7.32843 15 6.5 15C5.67157 15 5 15.6716 5 16.5ZM6.5 14C5.11929 14 4 15.1193 4 16.5C4 17.8807 5.11929 19 6.5 19C7.88071 19 9 17.8807 9 16.5C9 15.1193 7.88071 14 6.5 14Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                          <path
                            d="M3.5 6H15.5C15.7761 6 16 6.22386 16 6.5V14.05C16.1616 14.0172 16.3288 14 16.5 14C16.6716 14 16.8392 14.0173 17.0011 14.0502V10H19.5785C19.8201 10 20.0272 10.1723 20.0709 10.4097L20.9902 15.4097C21.0467 15.7169 20.8105 16 20.4979 16H18.95C18.9828 16.1616 19 16.3288 19 16.5C19 16.6712 18.9828 16.8384 18.95 17H20.4979C21.4359 17 22.1443 16.1506 21.9749 15.2291L21.0555 10.229C20.9246 9.51703 20.3033 9 19.5785 9H17V6.5C17 5.67157 16.3284 5 15.5 5H3.5C2.67157 5 2 5.67157 2 6.5V15.5C2 16.3284 2.67157 17 3.5 17H4.05001C4.01722 16.8384 4 16.6712 4 16.5C4 16.3288 4.01722 16.1616 4.05001 16H3.5C3.22386 16 3 15.7761 3 15.5V6.5C3 6.22386 3.22386 6 3.5 6Z"
                            fill="currentColor"
                          />
                          <path
                            d="M8.94999 16C8.98278 16.1616 9 16.3288 9 16.5C9 16.6712 8.98278 16.8384 8.94999 17H14.05C14.0172 16.8384 14 16.6712 14 16.5C14 16.3288 14.0172 16.1616 14.05 16H8.94999Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-left">
                          <span className="text-green-600">
                            Online: auf Lager
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 text-left">
                          Versandkostenfrei
                        </div>
                        <div className="text-sm text-gray-600 text-left">
                          Lieferzeitraum: {getDeliveryTimeframe()}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Disponibilidade na Loja */}
                <div data-testid="in-store-availability" className="mt-4">
                  <button
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    data-testid="in-store-availability-button"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-gray-600"
                        >
                          <path
                            d="M5 2.5C5 2.22386 5.22386 2 5.5 2H18.5C18.7761 2 19 2.22386 19 2.5V5.66667H18V3H6V5.66667H5V2.5ZM6 21V9H5V21.5C5 21.7761 5.22386 22 5.5 22H18.5C18.7761 22 19 21.7761 19 21.5V9H18V21H6Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                          <path
                            d="M3 21.5C3 21.2239 3.22386 21 3.5 21L20.5 21C20.7761 21 21 21.2239 21 21.5C21 21.7761 20.7761 22 20.5 22L3.5 22C3.22386 22 3 21.7761 3 21.5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                          <path
                            d="M13.5 15H10.5C10.2239 15 10 15.2239 10 15.5V21H14V15.5C14 15.2239 13.7761 15 13.5 15ZM10.5 14C9.67157 14 9 14.6716 9 15.5V22H15V15.5C15 14.6716 14.3284 14 13.5 14H10.5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                          <path
                            d="M9.5 6L8.5 9"
                            stroke="currentColor"
                            strokeLinecap="square"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14.5 6L15.5 9"
                            stroke="currentColor"
                            strokeLinecap="square"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.64414 6L4.27773 9H19.7238L18.3574 6H5.64414ZM19.0008 5H5.00077L3.04556 9.29275C2.89476 9.62384 3.13677 10 3.50058 10H20.501C20.8648 10 21.1068 9.62383 20.956 9.29275L19.0008 5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900 text-left">
                          Douglas-Filiale
                        </div>
                        <div className="text-sm text-gray-600 text-left">
                          Filialverfügbarkeit prüfen
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Seção de Informações do Produto */}
            <div
              className="mb-6 mx-4 sm:mx-6 lg:mx-8"
              style={{
                fontFamily:
                  "Avenir Next, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              <div
                className="e557dfab53c773eec7d4"
                data-testid="product-information"
              >
                <span className="aa6395229546fac01bf6 text-lg font-medium mb-4 block">
                  Produktinformationen
                </span>
                <div className="d5638c411254fedcaa71 mb-4">
                  <span className="fa00b3881a03f0873edb font-medium text-gray-900">
                    Duft:{" "}
                  </span>
                  <span className="text-gray-700">holzig, würzig</span>
                </div>
                <ul
                  className="c82335ac55749d46ac50 mb-6 space-y-2"
                  data-testid="bullet-points"
                >
                  <li className="text-gray-700 text-sm">
                    extravagant, exzessiv und luxuriös
                  </li>
                  <li className="text-gray-700 text-sm">
                    für Gentlemen, die Augenhöhe verführerisch finden
                  </li>
                  <li className="text-gray-700 text-sm">
                    ein Duft wie ein Goldbarren: imposant und zeitlos
                  </li>
                </ul>
                <section aria-label="Mehr zum Produkt">
                  <ul className="product-labels flex gap-4 flex-wrap">
                    <li
                      className="product-label flex items-center gap-2"
                      aria-label="vegan"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        role="img"
                        className="e426ac62a83ee13991ce a0c0d41398b693c4ed2e product-label__icon"
                      >
                        <path
                          d="M3.5 3C3.22386 3 3 3.22386 3 3.5V6.5C3 8.22391 3.68482 9.87721 4.90381 11.0962C6.12279 12.3152 7.77609 13 9.5 13H11.5V13.6429V14.5V20.5C11.5 20.7761 11.7239 21 12 21C12.2761 21 12.5 20.7761 12.5 20.5V15H15.1667C16.708 15 18.1897 14.4097 19.285 13.3536C20.3808 12.2969 21 10.8597 21 9.35714V7.5C21 7.22386 20.7761 7 20.5 7H17.8333C16.292 7 14.8103 7.59026 13.715 8.64639C13.2808 9.06509 12.8566 9.68403 12.5 10.3564V10C12.5 9.97282 12.4978 9.94614 12.4937 9.92013C12.4776 9.21797 12.4261 8.40209 12.2855 7.61587C12.1073 6.61953 11.7709 5.57853 11.0962 4.90381C9.87721 3.68482 8.22391 3 6.5 3H3.5ZM11.3011 7.79193C11.467 8.7194 11.5 9.714 11.5 10.5V10.7929L7.35355 6.64645C7.15829 6.45118 6.84171 6.45118 6.64645 6.64645C6.45118 6.84171 6.45118 7.15829 6.64645 7.35355L11.2929 12H9.5C8.04131 12 6.64236 11.4205 5.61091 10.3891C4.57946 9.35764 4 7.95869 4 6.5V4H6.5C7.95869 4 9.35764 4.57946 10.3891 5.61091C10.8396 6.0614 11.1319 6.84608 11.3011 7.79193ZM17.8333 8C16.5457 8 15.3143 8.49341 14.4092 9.36623C13.973 9.78686 13.4891 10.5415 13.112 11.3799C12.7698 12.1406 12.5462 12.9019 12.5064 13.4687L15.3492 11.2416C15.5588 11.0619 15.8745 11.0862 16.0542 11.2958C16.2339 11.5055 16.2096 11.8211 15.9999 12.0009L13.4482 14H15.1667C16.4543 14 17.6857 13.5066 18.5908 12.6338C19.4954 11.7615 20 10.5825 20 9.35714V8H17.8333Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="product-label__name text-sm">vegan</span>
                    </li>
                    <li
                      className="product-label flex items-center gap-2"
                      aria-label="acetonfrei"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        role="img"
                        className="e426ac62a83ee13991ce a0c0d41398b693c4ed2e product-label__icon"
                      >
                        <path
                          d="M9.45429 3.43625C9.50031 2.63935 10.1568 2 10.9666 2H13.0334C13.8432 2 14.4997 2.63935 14.5457 3.43625C14.6088 4.5294 14.7426 6.2672 14.9885 7.39333C15.157 8.16505 15.4408 8.88338 15.7734 9.59686C16.0588 10.209 16.3632 10.8617 16.609 11.883C16.825 12.78 16.9343 13.8158 16.9777 14.8636L15.9033 13.7891C15.8456 13.1925 15.7594 12.6261 15.6368 12.117C15.4145 11.1939 15.1452 10.6161 14.8636 10.0119C14.501 9.23393 14.1952 8.44788 14.0115 7.60667C13.9086 7.13555 13.8252 6.57418 13.7578 6H10.2422C10.1642 6.66499 10.0628 7.30647 9.93864 7.82448L9.09266 6.9785C9.28751 5.87251 9.39849 4.40254 9.45429 3.43625ZM16.9627 17.6698L18.1464 18.8536C18.3417 19.0488 18.6583 19.0488 18.8536 18.8536C19.0488 18.6583 19.0488 18.3417 18.8536 18.1464L5.85355 5.14645C5.65829 4.95118 5.34171 4.95118 5.14645 5.14645C4.95118 5.34171 4.95118 5.65829 5.14645 5.85355L8.4354 9.14251C8.03705 10.0396 7.62298 10.9231 7.39187 11.883C7.05014 13.3023 6.97549 15.069 7.00633 16.6807C7.03732 18.3002 7.17587 19.7988 7.27562 20.6969C7.3597 21.4539 8.00218 22 8.74558 22H15.2553C15.9987 22 16.6412 21.4539 16.7253 20.6969C16.8043 19.9853 16.9077 18.8968 16.9627 17.6698ZM15.644 16.3511L9.19022 9.89733C8.85384 10.6217 8.55088 11.3412 8.36409 12.117C8.18428 12.8639 8.08267 13.7344 8.03473 14.6421C8.5127 14.3513 9.05159 14.2997 9.56086 14.3813C10.5318 14.537 11.4114 15.0844 12.2497 15.5666C13.1474 16.0829 13.9288 16.524 14.5983 16.6313C14.9829 16.693 15.3577 16.6218 15.644 16.3511ZM10.9666 3C10.6983 3 10.4688 3.21444 10.4526 3.4939C10.4284 3.91349 10.3932 4.44083 10.3439 5H13.6561C13.6068 4.44083 13.5716 3.91349 13.5474 3.4939C13.5312 3.21444 13.3018 3 13.0334 3H10.9666ZM8.00015 16.1249C8.00068 16.3043 8.00274 16.4834 8.00614 16.6615C8.03635 18.2398 8.17168 19.7057 8.26951 20.5865C8.29534 20.8191 8.49341 21 8.74558 21H15.2553C15.5075 21 15.7056 20.8191 15.7314 20.5865C15.8148 19.8359 15.9254 18.6605 15.9749 17.3526C15.5154 17.6354 14.9675 17.7033 14.44 17.6187C13.5686 17.4791 12.6331 16.9408 11.8051 16.4645C11.0614 16.0367 10.2659 15.5071 9.40261 15.3687C9.0878 15.3183 8.83428 15.3495 8.61896 15.4603C8.41994 15.5627 8.20575 15.7577 8.00015 16.1249Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="product-label__name text-sm">
                        acetonfrei
                      </span>
                    </li>
                    <li
                      className="product-label flex items-center gap-2"
                      aria-label="ammoniakfrei"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        role="img"
                        className="e426ac62a83ee13991ce a0c0d41398b693c4ed2e product-label__icon"
                      >
                        <path
                          d="M9.9395 10.5H14.9573L15.9351 11.5373V15.5338L14.9351 16.5H9.93506L8.93506 15.5V11.5L9.9395 10.5Z"
                          stroke="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.93506 9.5C6.93506 7.84315 8.2782 6.5 9.93506 6.5H14.9351C16.5919 6.5 17.9351 7.84315 17.9351 9.5V20.5438C17.9351 21.0961 17.4873 21.5438 16.9351 21.5438H7.93506C7.38277 21.5438 6.93506 21.0961 6.93506 20.5438V9.5Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.93506 2.5H15.9351"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.43506 2.5H15.4351L14.9337 6.5H9.93506L9.43506 2.5Z"
                          stroke="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="product-label__name text-sm">
                        ammoniakfrei
                      </span>
                    </li>
                    <li
                      className="product-label flex items-center gap-2"
                      aria-label="komedogen-frei"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        role="img"
                        className="e426ac62a83ee13991ce a0c0d41398b693c4ed2e product-label__icon"
                      >
                        <path
                          d="M9.9395 10.5H14.9573L15.9351 11.5373V15.5338L14.9351 16.5H9.93506L8.93506 15.5V11.5L9.9395 10.5Z"
                          stroke="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.93506 9.5C6.93506 7.84315 8.2782 6.5 9.93506 6.5H14.9351C16.5919 6.5 17.9351 7.84315 17.9351 9.5V20.5438C17.9351 21.0961 17.4873 21.5438 16.9351 21.5438H7.93506C7.38277 21.5438 6.93506 21.0961 6.93506 20.5438V9.5Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.93506 2.5H15.9351"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.43506 2.5H15.4351L14.9337 6.5H9.93506L9.43506 2.5Z"
                          stroke="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="product-label__name text-sm">
                        komedogen-frei
                      </span>
                    </li>
                  </ul>
                </section>
              </div>
            </div>

            {/* Accordion de Detalhes */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div data-testid="accordion-panels">
                <div data-testid="accordion-panels__panel">
                  <button
                    type="button"
                    className="w-full px-4 flex items-center justify-between py-4 text-left"
                    data-testid="details"
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  >
                    <span className="text-lg font-medium">Produktdetails</span>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`text-gray-400 transition-transform duration-200 ${isDetailsOpen ? "rotate-90" : ""}`}
                    >
                      <path
                        d="M15.6001 11.2001C16.1333 11.6001 16.1333 12.4 15.6001 12.8L8.80143 17.9C8.58054 18.0657 8.26713 18.021 8.10142 17.8001C7.93572 17.5792 7.98046 17.2658 8.20135 17.1001L15 12L8.20135 6.9C7.98046 6.73429 7.93572 6.42089 8.10142 6.19999C8.26713 5.97909 8.58054 5.93435 8.80143 6.10006L15.6001 11.2001Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Conteúdo do Accordion */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isDetailsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="px-4 pb-4">
                      <div className="space-y-4 text-sm text-gray-600">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Produktinformationen
                          </h4>
                          <p>
                            <strong>Marke:</strong>{" "}
                            {product?.metafields?.["internal.brands"] ||
                              product?.primary_brand ||
                              product?.brands?.[0] ||
                              "N/A"}
                          </p>
                          <p>
                            <strong>Typ:</strong>{" "}
                            {product?.metafields?.["internal.category"] ||
                              product?.category?.type ||
                              "Parfum"}
                          </p>
                          <p>
                            <strong>Geschlecht:</strong>{" "}
                            {product?.tags?.includes("Herren")
                              ? "Herren"
                              : product?.tags?.includes("Damen")
                                ? "Damen"
                                : "Unisex"}
                          </p>
                          {product?.variants?.[0]?.weight && (
                            <p>
                              <strong>Größe:</strong>{" "}
                              {product.variants[0].weight}
                            </p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Beschreibung
                          </h4>
                          <p>
                            {product?.metafields?.["seo.meta_description"] ||
                              product?.description ||
                              "Ein exquisiter Duft, der Eleganz und Raffinesse verkörpert."}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Lieferung & Versand
                          </h4>
                          <p>Lieferzeit: 3-10 Werktage</p>
                          <p>30 Tage Rückgaberecht</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Avaliações */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <button
                type="button"
                className="w-full px-4 flex items-center justify-between py-4 text-left"
                data-testid="product-feedback"
                onClick={() => setIsReviewsOpen(!isReviewsOpen)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">Bewertungen</span>
                  <div className="flex items-center gap-1">
                    <span
                      className="flex gap-0.5"
                      data-testid="rating-stars"
                      data-average-rating={averageRating.toFixed(1)}
                    >
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          width="16"
                          height="16"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={
                            i < Math.floor(averageRating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          <path
                            d="M6.89541 5.13455L6 3.22465L5.10459 5.13455L2.97747 5.45993L4.52055 7.04331L4.16935 9.19887L6 8.18573L7.83065 9.19887L7.47945 7.04331L9.02253 5.45993L6.89541 5.13455ZM10.8683 4.69576C10.993 4.71484 11.0439 4.86712 10.9558 4.95752L8.58321 7.39205L9.14164 10.8195C9.16247 10.9473 9.02692 11.0429 8.91369 10.9803L6 9.36775L3.08631 10.9803C2.97308 11.0429 2.83753 10.9473 2.85836 10.8195L3.41679 7.39205L1.04422 4.95752C0.956122 4.86712 1.00704 4.71484 1.13175 4.69576L4.40349 4.1953L5.85969 1.08924C5.91548 0.970253 6.08452 0.970253 6.14031 1.08924L7.59651 4.1953L10.8683 4.69576Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {averageRating.toFixed(1)}&nbsp;({totalReviews})
                    </span>
                  </div>
                </div>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`text-gray-400 transition-transform duration-200 ${isReviewsOpen ? "rotate-90" : ""}`}
                >
                  <path
                    d="M15.6001 11.2001C16.1333 11.6001 16.1333 12.4 15.6001 12.8L8.80143 17.9C8.58054 18.0657 8.26713 18.021 8.10142 17.8001C7.93572 17.5792 7.98046 17.2658 8.20135 17.1001L15 12L8.20135 6.9C7.98046 6.73429 7.93572 6.42089 8.10142 6.19999C8.26713 5.97909 8.58054 5.93435 8.80143 6.10006L15.6001 11.2001Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Conteúdo expansível das avaliações */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isReviewsOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="px-4 pb-4 space-y-4">
                  {/* Lista de comentários fake */}
                  <div className="space-y-4 mb-6">
                    {fakeReviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {review.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">
                                {review.name}
                              </span>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={
                                      i < review.rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }
                                  >
                                    <path
                                      d="M6.89541 5.13455L6 3.22465L5.10459 5.13455L2.97747 5.45993L4.52055 7.04331L4.16935 9.19887L6 8.18573L7.83065 9.19887L7.47945 7.04331L9.02253 5.45993L6.89541 5.13455ZM10.8683 4.69576C10.993 4.71484 11.0439 4.86712 10.9558 4.95752L8.58321 7.39205L9.14164 10.8195C9.16247 10.9473 9.02692 11.0429 8.91369 10.9803L6 9.36775L3.08631 10.9803C2.97308 11.0429 2.83753 10.9473 2.85836 10.8195L3.41679 7.39205L1.04422 4.95752C0.956122 4.86712 1.00704 4.71484 1.13175 4.69576L4.40349 4.1953L5.85969 1.08924C5.91548 0.970253 6.08452 0.970253 6.14031 1.08924L7.59651 4.1953L10.8683 4.69576Z"
                                      fill="currentColor"
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString("de-DE")}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          Schreiben Sie Ihre Bewertung
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Teilen Sie Ihre Erfahrungen mit diesem Produkt und helfen
                      Sie anderen Kunden.
                    </p>
                    <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                      Bewertung schreiben
                    </button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Bewertungsrichtlinien
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Bewertungen müssen ehrlich und hilfreich sein</li>
                      <li>• Nur verifizierte Käufer können bewerten</li>
                      <li>• Bewertungen werden vor Veröffentlichung geprüft</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Vantagens */}
            <div className="border-t px-4 border-gray-200 pt-6 mb-8">
              <h2 className="text-lg font-medium mb-4">Deine Vorteile</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-600 flex-shrink-0"
                  >
                    <path
                      d="M15 16.5C15 17.3284 15.6716 18 16.5 18C17.3284 18 18 17.3284 18 16.5C18 15.6716 17.3284 15 16.5 15C15.6716 15 15 15.6716 15 16.5ZM16.5 14C15.1193 14 14 15.1193 14 16.5C14 17.8807 15.1193 19 16.5 19C17.8807 19 19 17.8807 19 16.5C19 15.1193 17.8807 14 16.5 14Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                    <path
                      d="M5 16.5C5 17.3284 5.67157 18 6.5 18C7.32843 18 8 17.3284 8 16.5C8 15.6716 7.32843 15 6.5 15C5.67157 15 5 15.6716 5 16.5ZM6.5 14C5.11929 14 4 15.1193 4 16.5C4 17.8807 5.11929 19 6.5 19C7.88071 19 9 17.8807 9 16.5C9 15.1193 7.88071 14 6.5 14Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                    <path
                      d="M3.5 6H15.5C15.7761 6 16 6.22386 16 6.5V14.05C16.1616 14.0172 16.3288 14 16.5 14C16.6716 14 16.8392 14.0173 17.0011 14.0502V10H19.5785C19.8201 10 20.0272 10.1723 20.0709 10.4097L20.9902 15.4097C21.0467 15.7169 20.8105 16 20.4979 16H18.95C18.9828 16.1616 19 16.3288 19 16.5C19 16.6712 18.9828 16.8384 18.95 17H20.4979C21.4359 17 22.1443 16.1506 21.9749 15.2291L21.0555 10.229C20.9246 9.51703 20.3033 9 19.5785 9H17V6.5C17 5.67157 16.3284 5 15.5 5H3.5C2.67157 5 2 5.67157 2 6.5V15.5C2 16.3284 2.67157 17 3.5 17H4.05001C4.01722 16.8384 4 16.6712 4 16.5C4 16.3288 4.01722 16.1616 4.05001 16H3.5C3.22386 16 3 15.7761 3 15.5V6.5C3 6.22386 3.22386 6 3.5 6Z"
                      fill="currentColor"
                    />
                    <path
                      d="M8.94999 16C8.98278 16.1616 9 16.3288 9 16.5C9 16.6712 8.98278 16.8384 8.94999 17H14.05C14.0172 16.8384 14 16.6712 14 16.5C14 16.3288 14.0172 16.1616 14.05 16H8.94999Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="text-sm">
                    Für diese Aktion ist kein Expressversand verfügbar. (Extreme
                    Nachfrage)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-600 flex-shrink-0"
                  >
                    <path
                      d="M3.72372 3.0529C3.47673 2.9294 3.17639 3.02951 3.0529 3.2765C2.9294 3.52349 3.02951 3.82383 3.2765 3.94732L5.07081 4.84448L7.92941 16.2789C7.12653 16.6949 6.57789 17.5334 6.57789 18.5001C6.57789 19.8808 7.69718 21.0001 9.07789 21.0001C10.4586 21.0001 11.5779 19.8808 11.5779 18.5001C11.5779 18.4097 11.5731 18.3205 11.5638 18.2326L16.9157 16.7491C17.1818 16.6754 17.3377 16.3998 17.264 16.1337C17.1902 15.8676 16.9147 15.7117 16.6486 15.7854L11.26 17.2791C10.832 16.5159 10.0152 16.0001 9.07789 16.0001C9.01543 16.0001 8.95349 16.0024 8.89218 16.0069L6.04096 4.60194C5.97015 4.31873 5.77913 4.0806 5.51803 3.95005L3.72372 3.0529ZM9.07789 20.0001C9.90632 20.0001 10.5779 19.3285 10.5779 18.5001C10.5779 17.6717 9.90632 17.0001 9.07789 17.0001C8.24947 17.0001 7.57789 17.6717 7.57789 18.5001C7.57789 19.3285 8.24947 20.0001 9.07789 20.0001Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                    <path
                      d="M17.8224 4.25061L10.3913 6.24176C10.1246 6.31323 9.96628 6.5874 10.0377 6.85413L11.5907 12.6497C11.6621 12.9164 11.9363 13.0747 12.203 13.0032L19.6341 11.0121C19.9008 10.9406 20.0591 10.6665 19.9876 10.3997L18.4347 4.60417C18.3633 4.33743 18.0891 4.17914 17.8224 4.25061ZM10.1325 5.27583C9.33228 5.49025 8.85741 6.31275 9.07182 7.11295L10.6247 12.9085C10.8391 13.7087 11.6617 14.1836 12.4619 13.9692L19.8929 11.978C20.6931 11.7636 21.168 10.9411 20.9536 10.1409L19.4007 4.34535C19.1862 3.54515 18.3637 3.07028 17.5635 3.28469L10.1325 5.27583Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">Versandkostenfrei ab 34,95 €</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-600 flex-shrink-0"
                  >
                    <path
                      d="M5.25422 3.06458C5.41129 2.97592 5.60394 2.97872 5.75836 3.07193L8.36206 4.64339C8.84217 4.93884 9 5.39868 9 5.80769V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V5.80769C8 5.72837 7.98565 5.66883 7.96394 5.62473C7.94429 5.58484 7.91034 5.53995 7.83948 5.49601L6 4.38579V9.5C6 9.77614 5.77614 10 5.5 10C5.22386 10 5 9.77614 5 9.5V3.5C5 3.31963 5.09714 3.15324 5.25422 3.06458Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                    <path
                      d="M4 10.5C4 9.67157 4.67157 9 5.5 9H8.5C9.32843 9 10 9.67157 10 10.5V12.5H9V10.5C9 10.2239 8.77614 10 8.5 10H5.5C5.22386 10 5 10.2239 5 10.5V12.5H4V10.5Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                    <rect
                      x="3.5"
                      y="12.5"
                      width="7"
                      height="8"
                      rx="1.5"
                      stroke="currentColor"
                    />
                    <path
                      d="M18.9971 4H14.0029C13.4232 4 12.9627 4.42113 13.004 5L13.934 16H19.0659L19.996 5C20.0373 4.42113 19.5768 4 18.9971 4ZM19.996 17L20.9948 5C21.0774 3.84227 20.1565 3 18.9971 3H14.0027C12.8434 3 11.9226 3.84227 12.0052 5L13.004 17H19.996Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                    <path
                      d="M18.997 17H14.0028V19.5C14.0028 19.7761 14.2264 20 14.5022 20H18.4976C18.7734 20 18.997 19.7761 18.997 19.5V17ZM13.0039 16V19.5C13.0039 20.3284 13.6747 21 14.5022 21H18.4976C19.3251 21 19.9959 20.3284 19.9959 19.5V16H13.0039Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">
                    2 Gratis-Proben nach Wahl³ ab 10 €¹
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-thin-light text-gray-900 mb-8 text-center">
                Das könnte Ihnen auch gefallen
              </h2>
              <div className="related-products-grid">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.handle}`}
                    className="related-product-card group"
                  >
                    {/* Product Image */}
                    <div className="aspect-square relative overflow-hidden bg-[#f5f5f5]">
                      {relatedProduct.images &&
                      relatedProduct.images.length > 0 ? (
                        <Image
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {relatedProduct.primary_brand}
                      </p>
                      <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                        {relatedProduct.title}
                      </h3>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(
                          getDiscountedPrice(relatedProduct),
                          relatedProduct.currency,
                        )}
                        {getDiscountedPrice(relatedProduct) !== relatedProduct.price && (
                          <span className="ml-2 text-xs line-through text-gray-400">
                            {formatPrice(relatedProduct.price, relatedProduct.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Footer integrado na seção de conteúdo */}
          <Footer />
        </div>
      </section>

      {/* Botão Add to Cart fixo na parte inferior */}
      {!state.isOpen && (
        <div className="fixed-cart-button">
          <button
            className="fixed-add-to-cart-button"
            onClick={handleAddToCart}
          >
            <span className="flex items-center justify-center gap-2 uppercase font-thin">
              {selectedPackageSize === 1 
                ? `In den Warenkorb - ${formatPrice(getDiscountedPrice(product), product.currency)}`
                : isComplete
                  ? `Bundle in den Warenkorb - ${selectedPackageSize === 3 ? '€49,99' : '€99,99'}`
                  : `Duft ${selectedItems.filter(i => i !== null).length + 1} von ${selectedPackageSize} auswählen`
              }
            </span>
          </button>

        </div>
      )}
    </div>
  );
}
