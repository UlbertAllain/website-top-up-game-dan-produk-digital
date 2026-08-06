export type WhatsAppProductData = {
  name: string;
  code: string;
  price: number;
};

export function normalizeWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  return digits;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function applyWhatsAppTemplate(
  template: string,
  product?: WhatsAppProductData,
): string {
  if (!product) {
    return template;
  }

  return template
    .replaceAll("{productName}", product.name)
    .replaceAll("{productCode}", product.code)
    .replaceAll("{productPrice}", formatRupiah(product.price));
}

export function createWhatsAppUrl(
  phoneNumber: string,
  message: string,
  product?: WhatsAppProductData,
): string | null {
  const normalizedNumber = normalizeWhatsAppNumber(phoneNumber);

  if (!normalizedNumber) {
    return null;
  }

  const finalMessage = applyWhatsAppTemplate(message, product).trim();

  const baseUrl = `https://wa.me/${normalizedNumber}`;

  if (!finalMessage) {
    return baseUrl;
  }

  return `${baseUrl}?text=${encodeURIComponent(finalMessage)}`;
}
