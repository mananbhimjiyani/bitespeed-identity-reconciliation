// src/controllers/identifyController.ts
import { Request, Response } from 'express';
import { findContacts, createContact, updateContact, getLinkedContacts } from '../services/contactService';
import { Contact } from '@prisma/client';

interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}

interface IdentifyResponse {
  contact: {
    primaryContatctId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export const identify = async (req: Request<{}, {}, IdentifyRequest>, res: Response<IdentifyResponse>) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Either email or phoneNumber must be provided." });
  }

  try {
    let existingContacts = await findContacts(email, phoneNumber);

    if (existingContacts.length === 0) {
      // Scenario 1: No existing contacts match
      const newPrimaryContact = await createContact(email, phoneNumber, null, 'primary');
      return res.status(200).json({
        contact: {
          primaryContatctId: newPrimaryContact.id,
          emails: newPrimaryContact.email ? [newPrimaryContact.email] : [],
          phoneNumbers: newPrimaryContact.phoneNumber ? [newPrimaryContact.phoneNumber] : [],
          secondaryContactIds: [],
        },
      });
    }

    // Scenario 2: Existing contacts found
    let primaryContacts = existingContacts.filter(c => c.linkPrecedence === 'primary');
    let secondaryContacts = existingContacts.filter(c => c.linkPrecedence === 'secondary');

    let ultimatePrimaryContact: Contact;

    if (primaryContacts.length === 0) {
        // This case should ideally not happen if findContacts returns secondary and we don't have a primary.
        // It implies the found secondary contacts are orphaned or their primary isn't found.
        // For simplicity, we'll assume a primary always exists for linked secondaries.
        // If an email/phoneNumber of a secondary matches but no primary, the primary would be found.
        // We'll consider the oldest found secondary's primary as the ultimate primary.
        const linkedIds = new Set(secondaryContacts.map(sc => sc.linkedId).filter(Boolean) as number[]);
        const potentialPrimaries = await prisma.contact.findMany({
            where: {
                id: { in: Array.from(linkedIds) },
                linkPrecedence: 'primary'
            },
            orderBy: { createdAt: 'asc' }
        });
        if (potentialPrimaries.length > 0) {
            ultimatePrimaryContact = potentialPrimaries[0];
        } else {
            // Fallback: If for some reason we only find secondary contacts and no primary,
            // create a new primary. This might indicate data inconsistency.
            console.warn("Found secondary contacts without a direct primary match. Creating new primary.");
            ultimatePrimaryContact = await createContact(email, phoneNumber, null, 'primary');
            // If the incoming request has existing secondary, they will be linked in the next step.
        }
    } else {
        // Sort primary contacts by createdAt to find the oldest
        primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        ultimatePrimaryContact = primaryContacts[0];
    }


    // Merge multiple primary contacts if they are now linked
    for (const contact of primaryContacts) {
      if (contact.id !== ultimatePrimaryContact.id) {
        await updateContact(contact.id, {
          linkPrecedence: 'secondary',
          linkedId: ultimatePrimaryContact.id,
        });
        // Add this newly demoted primary to secondary contacts for response
        secondaryContacts.push({ ...contact, linkPrecedence: 'secondary', linkedId: ultimatePrimaryContact.id });
      }
    }

    // Check if a new secondary contact needs to be created
    const allLinkedContacts = await getLinkedContacts(ultimatePrimaryContact.id); // Get all contacts linked to the ultimate primary
    const existingEmails = new Set(allLinkedContacts.map(c => c.email).filter(Boolean) as string[]);
    const existingPhoneNumbers = new Set(allLinkedContacts.map(c => c.phoneNumber).filter(Boolean) as string[]);

    let newContactCreated = false;
    if (email && !existingEmails.has(email) || phoneNumber && !existingPhoneNumbers.has(phoneNumber)) {
        // If the incoming request has new email/phoneNumber not present in the linked chain
        const newSecondaryContact = await createContact(email, phoneNumber, ultimatePrimaryContact.id, 'secondary');
        secondaryContacts.push(newSecondaryContact);
        newContactCreated = true;
    }


    // Re-fetch all linked contacts to ensure we have the most up-to-date view
    const consolidatedContacts = await getLinkedContacts(ultimatePrimaryContact.id);

    const uniqueEmails = new Set<string>();
    const uniquePhoneNumbers = new Set<string>();
    const secondaryContactIds = new Set<number>();

    // Add primary contact's email and phone number first (if they exist)
    if (ultimatePrimaryContact.email) uniqueEmails.add(ultimatePrimaryContact.email);
    if (ultimatePrimaryContact.phoneNumber) uniquePhoneNumbers.add(ultimatePrimaryContact.phoneNumber);

    for (const contact of consolidatedContacts) {
      if (contact.email) uniqueEmails.add(contact.email);
      if (contact.phoneNumber) uniquePhoneNumbers.add(contact.phoneNumber);
      if (contact.linkPrecedence === 'secondary') {
        secondaryContactIds.add(contact.id);
      }
    }

    const emailsArray = Array.from(uniqueEmails);
    const phoneNumbersArray = Array.from(uniquePhoneNumbers);

    // Ensure primary contact's email/phoneNumber is at the front if present
    if (ultimatePrimaryContact.email && emailsArray[0] !== ultimatePrimaryContact.email) {
      const index = emailsArray.indexOf(ultimatePrimaryContact.email);
      if (index > -1) {
        emailsArray.splice(index, 1);
        emailsArray.unshift(ultimatePrimaryContact.email);
      }
    }
    if (ultimatePrimaryContact.phoneNumber && phoneNumbersArray[0] !== ultimatePrimaryContact.phoneNumber) {
      const index = phoneNumbersArray.indexOf(ultimatePrimaryContact.phoneNumber);
      if (index > -1) {
        phoneNumbersArray.splice(index, 1);
        phoneNumbersArray.unshift(ultimatePrimaryContact.phoneNumber);
      }
    }


    res.status(200).json({
      contact: {
        primaryContatctId: ultimatePrimaryContact.id,
        emails: emailsArray,
        phoneNumbers: phoneNumbersArray,
        secondaryContactIds: Array.from(secondaryContactIds).sort((a, b) => a - b), // Sort for consistent output
      },
    });
  } catch (error) {
    console.error('Error during identification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};