// src/services/contactService.ts
import { PrismaClient, Contact } from '@prisma/client';

const prisma = new PrismaClient();

export const findContacts = async (email?: string, phoneNumber?: string): Promise<Contact[]> => {
  const query: any = {};
  if (email && phoneNumber) {
    query.OR = [
      { email },
      { phoneNumber },
    ];
  } else if (email) {
    query.email = email;
  } else if (phoneNumber) {
    query.phoneNumber = phoneNumber;
  } else {
    return []; // Should not happen based on requirements, but good for safety
  }

  return prisma.contact.findMany({
    where: query,
    orderBy: { createdAt: 'asc' }, // Order by creation time to easily find the oldest
  });
};

export const createContact = async (email?: string, phoneNumber?: string, linkedId?: number, linkPrecedence: 'primary' | 'secondary' = 'primary'): Promise<Contact> => {
  return prisma.contact.create({
    data: {
      email,
      phoneNumber,
      linkedId,
      linkPrecedence,
    },
  });
};

export const updateContact = async (id: number, data: Partial<Contact>): Promise<Contact> => {
  return prisma.contact.update({
    where: { id },
    data: { ...data, updatedAt: new Date() }, // Ensure updatedAt is updated
  });
};

export const getLinkedContacts = async (primaryContactId: number): Promise<Contact[]> => {
    return prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryContactId },
          { linkedId: primaryContactId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  };