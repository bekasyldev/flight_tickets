import { Collection, Db } from 'mongodb';
import { getDatabase } from './mongodb';

export interface Customer {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  phone_number?: string;
  created_at: Date;
  updated_at: Date;
  bookings: string[]; // Array of booking references
}

export interface EmailLog {
  id: string;
  booking_reference: string;
  customer_email: string;
  email_type: 'ticket_confirmation';
  sent_at: Date;
  status: 'sent' | 'failed';
  resend_message_id?: string;
  order_id: string;
}

export class CustomerManager {
  private customersCollection: Collection<Customer> | null = null;
  private emailLogsCollection: Collection<EmailLog> | null = null;
  
  private async getCustomersCollection(): Promise<Collection<Customer>> {
    if (!this.customersCollection) {
      const db: Db = await getDatabase();
      this.customersCollection = db.collection<Customer>('customers');
      await this.createCustomerIndexes();
    }
    return this.customersCollection;
  }
  
  private async getEmailLogsCollection(): Promise<Collection<EmailLog>> {
    if (!this.emailLogsCollection) {
      const db: Db = await getDatabase();
      this.emailLogsCollection = db.collection<EmailLog>('email_logs');
      await this.createEmailLogIndexes();
    }
    return this.emailLogsCollection;
  }
  
  private async createCustomerIndexes(): Promise<void> {
    const collection = await this.getCustomersCollection();
    try {
      await collection.createIndex({ email: 1 }, { unique: true });
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ created_at: 1 });
      console.log('Customer indexes created successfully');
    } catch (error) {
      console.error('Error creating customer indexes:', error);
    }
  }
  
  private async createEmailLogIndexes(): Promise<void> {
    const collection = await this.getEmailLogsCollection();
    try {
      await collection.createIndex({ booking_reference: 1 }, { unique: true });
      await collection.createIndex({ customer_email: 1 });
      await collection.createIndex({ sent_at: 1 });
      await collection.createIndex({ order_id: 1 });
      console.log('Email log indexes created successfully');
    } catch (error) {
      console.error('Error creating email log indexes:', error);
    }
  }
  
  async createOrUpdateCustomer(customerData: {
    email: string;
    given_name: string;
    family_name: string;
    phone_number?: string;
    booking_reference: string;
  }): Promise<Customer> {
    const collection = await this.getCustomersCollection();
    const customerId = `cus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const existingCustomer = await collection.findOne({ email: customerData.email });
    
    if (existingCustomer) {
      // Update existing customer with new booking
      const updatedBookings = existingCustomer.bookings.includes(customerData.booking_reference) 
        ? existingCustomer.bookings 
        : [...existingCustomer.bookings, customerData.booking_reference];
        
      await collection.updateOne(
        { email: customerData.email },
        {
          $set: {
            given_name: customerData.given_name,
            family_name: customerData.family_name,
            phone_number: customerData.phone_number,
            updated_at: new Date(),
            bookings: updatedBookings
          }
        }
      );
      
      return {
        ...existingCustomer,
        given_name: customerData.given_name,
        family_name: customerData.family_name,
        phone_number: customerData.phone_number,
        updated_at: new Date(),
        bookings: updatedBookings
      };
    } else {
      // Create new customer
      const newCustomer: Customer = {
        id: customerId,
        email: customerData.email,
        given_name: customerData.given_name,
        family_name: customerData.family_name,
        phone_number: customerData.phone_number,
        created_at: new Date(),
        updated_at: new Date(),
        bookings: [customerData.booking_reference]
      };
      
      await collection.insertOne(newCustomer);
      return newCustomer;
    }
  }
  
  async checkEmailAlreadySent(bookingReference: string): Promise<boolean> {
    const collection = await this.getEmailLogsCollection();
    const existingLog = await collection.findOne({ 
      booking_reference: bookingReference,
      status: 'sent'
    });
    return !!existingLog;
  }
  
  async logEmailSent(emailLogData: {
    booking_reference: string;
    customer_email: string;
    order_id: string;
    resend_message_id?: string;
    status: 'sent' | 'failed';
  }): Promise<void> {
    const collection = await this.getEmailLogsCollection();
    const logId = `eml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const emailLog: EmailLog = {
      id: logId,
      booking_reference: emailLogData.booking_reference,
      customer_email: emailLogData.customer_email,
      email_type: 'ticket_confirmation',
      sent_at: new Date(),
      status: emailLogData.status,
      resend_message_id: emailLogData.resend_message_id,
      order_id: emailLogData.order_id
    };
    
    await collection.insertOne(emailLog);
  }
  
  async getCustomerByEmail(email: string): Promise<Customer | null> {
    const collection = await this.getCustomersCollection();
    return await collection.findOne({ email });
  }
  
  async getEmailLogs(bookingReference: string): Promise<EmailLog[]> {
    const collection = await this.getEmailLogsCollection();
    return await collection.find({ booking_reference: bookingReference }).toArray();
  }
}

export const customerManager = new CustomerManager();
