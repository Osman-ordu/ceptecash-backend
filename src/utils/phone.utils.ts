export function normalizePhoneNumber(phone: string): string {
  if (!phone) return phone;

  let normalized = phone.replace(/[\s\-\(\)]/g, '');

  if (normalized.startsWith('+')) {
    normalized = normalized.substring(1);
  }

  if (normalized.startsWith('0') && normalized.length === 11) {
    normalized = '90' + normalized.substring(1);
  }

  return normalized;
}

export async function findUserByPhone(prisma: any, phone: string) {
  const normalized = normalizePhoneNumber(phone);
  
  let user = await prisma.user.findUnique({ where: { phone: normalized } });
  
  if (user) return user;

  user = await prisma.user.findUnique({ where: { phone: `+${normalized}` } });
  if (user) return user;

  if (normalized.startsWith('90') && normalized.length === 12) {
    const turkishFormat = '0' + normalized.substring(2);
    user = await prisma.user.findUnique({ where: { phone: turkishFormat } });
    if (user) return user;
  }

  return null;
}

