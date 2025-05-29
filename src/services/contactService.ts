import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ContactResponse {
  primaryContatctId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

interface IdentifyInput {
  email?: string;
  phoneNumber?: string;
}

export const identifyContact = async ({ email, phoneNumber }: IdentifyInput): Promise<ContactResponse> => {
  // Find existing contacts by email or phoneNumber
  const existingContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined },
      ],
      deletedAt: null,
    },
  });

  // If no existing contacts, create a new primary contact
  if (!existingContacts.length) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      },
    });
    return {
      primaryContatctId: newContact.id,
      emails: newContact.email ? [newContact.email] : [],
      phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
      secondaryContactIds: [],
    };
  }

  // Find the primary contact (earliest created or already marked primary)
  let primaryContact = existingContacts.find((c) => c.linkPrecedence === 'primary');
  if (!primaryContact) {
    primaryContact = existingContacts.reduce((prev, curr) =>
      prev.createdAt < curr.createdAt ? prev : curr
    );
  }

  // Check if the request introduces new information
  const isNewEmail = email && !existingContacts.some((c) => c.email === email);
  const isNewPhoneNumber = phoneNumber && !existingContacts.some((c) => c.phoneNumber === phoneNumber);

  let newContact = null;
  if (isNewEmail || isNewPhoneNumber) {
    // Create a secondary contact if new information is provided
    newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      },
    });
  }

  // Handle case where two primary contacts need to be linked
  const otherPrimaries = existingContacts.filter(
    (c) => c.linkPrecedence === 'primary' && c.id !== primaryContact!.id
  );
  if (otherPrimaries.length) {
    const earliestPrimary = [primaryContact, ...otherPrimaries].reduce((prev, curr) =>
      prev.createdAt < curr.createdAt ? prev : curr
    );
    for (const contact of otherPrimaries) {
      if (contact.id !== earliestPrimary.id) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            linkPrecedence: 'secondary',
            linkedId: earliestPrimary.id,
            updatedAt: new Date(),
          },
        });
      }
    }
    primaryContact = earliestPrimary;
  }

  // Fetch all contacts linked to the primary contact
  const linkedContacts = await prisma.contact.findMany({
    where: {
      OR: [{ id: primaryContact!.id }, { linkedId: primaryContact!.id }],
      deletedAt: null,
    },
  });

  // Aggregate response data
  const emails = Array.from(new Set(linkedContacts.map((c) => c.email).filter(Boolean))) as string[];
  const phoneNumbers = Array.from(
    new Set(linkedContacts.map((c) => c.phoneNumber).filter(Boolean))
  ) as string[];
  const secondaryContactIds = linkedContacts
    .filter((c) => c.linkPrecedence === 'secondary')
    .map((c) => c.id);

  // Ensure primary contact's email and phoneNumber are first
  if (primaryContact.email) {
    emails.unshift(emails.splice(emails.indexOf(primaryContact.email), 1)[0]);
  }
  if (primaryContact.phoneNumber) {
    phoneNumbers.unshift(phoneNumbers.splice(phoneNumbers.indexOf(primaryContact.phoneNumber), 1)[0]);
  }

  return {
    primaryContatctId: primaryContact.id,
    emails,
    phoneNumbers,
    secondaryContactIds,
  };
};