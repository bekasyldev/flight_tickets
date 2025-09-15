'use client';

import React from 'react';
import Header from '../components/Header';
import { useTranslation } from '../lib/i18n';

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('terms.title')}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          
          <section className="mb-8">
            <p className="text-gray-700 mb-4">
              {t('terms.introduction')}
            </p>
            <p className="text-gray-700 mb-4">
              {t('terms.platformDescription')}
            </p>
            <p className="text-gray-700 mb-4">
              {t('terms.paymentProcessing.mdl')}
            </p>
            <p className="text-gray-700 mb-4">
              {t('terms.paymentProcessing.foreign')}
            </p>
          </section>

          {/* Agreement */}
          <section className="mb-8">
            <p className="text-gray-700 mb-4">
              {t('terms.agreement')}
            </p>
            <p className="text-gray-700 mb-4">
              {t('terms.ownership')}
            </p>
          </section>

          {/* Flight Ticket Conditions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.flightConditions.title')}</h2>
            <p className="text-gray-700 mb-4">{t('terms.flightConditions.reservationTerms')}</p>
            <p className="text-gray-700 mb-4">{t('terms.flightConditions.lowCostTerms')}</p>
            <p className="text-gray-700 mb-4">{t('terms.flightConditions.priceChanges')}</p>
          </section>

          {/* Cancellations/Modifications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.cancellations.title')}</h2>
            <p className="text-gray-700 mb-4">{t('terms.cancellations.responsibility')}</p>
            <p className="text-gray-700 mb-4">{t('terms.cancellations.fees')}</p>
            <p className="text-gray-700 mb-4">{t('terms.cancellations.serviceFee')}</p>
            <p className="text-gray-700 mb-4">{t('terms.cancellations.forceMajeure')}</p>
            <p className="text-gray-700 mb-4">{t('terms.cancellations.tariffRules')}</p>
          </section>

          {/* Baggage */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.baggage.title')}</h2>
            <p className="text-gray-700 mb-4">{t('terms.baggage.rules')}</p>
            <p className="text-gray-700 mb-4">{t('terms.baggage.inclusion')}</p>
            <p className="text-gray-700 mb-4">{t('terms.baggage.limits')}</p>
          </section>

          {/* Check-in */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.checkin.title')}</h2>
            <p className="text-gray-700 mb-4">{t('terms.checkin.fees')}</p>
            <p className="text-gray-700 mb-4">{t('terms.checkin.service')}</p>
          </section>

          {/* Smart Connections */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.smartConnections.title')}</h2>
            <p className="text-gray-700 mb-4">{t('terms.smartConnections.description')}</p>
            <p className="text-gray-700 mb-4">{t('terms.smartConnections.risks')}</p>
            <p className="text-gray-700 mb-4">{t('terms.smartConnections.separateFlights')}</p>
          </section>

          {/* Force Majeure */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.forceMajeure.title')}</h2>
            <p className="text-gray-700 mb-4">{t('terms.forceMajeure.definition')}</p>
            <p className="text-gray-700 mb-4">{t('terms.forceMajeure.recognition')}</p>
            <p className="text-gray-700 mb-4">{t('terms.forceMajeure.civilCode')}</p>
          </section>

          {/* Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.services.title')}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1</h3>
                <p className="text-gray-700">{t('terms.services.onlineDatabase')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2</h3>
                <p className="text-gray-700">{t('terms.services.information')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1.3</h3>
                <p className="text-gray-700">{t('terms.services.accommodationPlatform')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1.4</h3>
                <p className="text-gray-700">{t('terms.services.supplierResponsibility')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1.5</h3>
                <p className="text-gray-700">{t('terms.services.personalUse')}</p>
              </div>
            </div>
          </section>

          {/* Tariffs and Prices */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.tariffs.title')}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1</h3>
                <p className="text-gray-700">{t('terms.tariffs.searchResults')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2</h3>
                <p className="text-gray-700">{t('terms.tariffs.specialOffers')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.3</h3>
                <p className="text-gray-700">{t('terms.tariffs.cardPayment')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.4</h3>
                <p className="text-gray-700">{t('terms.tariffs.pricingSystem')}</p>
              </div>
            </div>
          </section>

          {/* Other Conditions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.otherConditions.title')}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.1</h3>
                <p className="text-gray-700">{t('terms.otherConditions.legislation')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.2</h3>
                <p className="text-gray-700">{t('terms.otherConditions.acknowledgment')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.3</h3>
                <p className="text-gray-700">{t('terms.otherConditions.intellectualProperty')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.4</h3>
                <p className="text-gray-700">{t('terms.otherConditions.disputes')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.5</h3>
                <p className="text-gray-700">{t('terms.otherConditions.liability')}</p>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.dataProtection.title')}</h2>
            <p className="text-gray-700 mb-4">{t('terms.dataProtection.commitment')}</p>
            <p className="text-gray-700 mb-4">{t('terms.dataProtection.importance')}</p>
            <p className="text-gray-700 mb-4">{t('terms.dataProtection.confidentiality')}</p>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">{t('terms.dataProtection.whatData')}</h3>
            <p className="text-gray-700 mb-4">{t('terms.dataProtection.dataTypes')}</p>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">{t('terms.dataProtection.purposes')}</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>{t('terms.dataProtection.purposesList.commercial')}</li>
              <li>{t('terms.dataProtection.purposesList.billing')}</li>
              <li>{t('terms.dataProtection.purposesList.marketing')}</li>
              <li>{t('terms.dataProtection.purposesList.customerRelations')}</li>
              <li>{t('terms.dataProtection.purposesList.legalObligations')}</li>
              <li>{t('terms.dataProtection.purposesList.communication')}</li>
            </ul>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">{t('terms.dataProtection.yourRights')}</h3>
            <p className="text-gray-700 mb-4">{t('terms.dataProtection.rightsDescription')}</p>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">{t('terms.dataProtection.exercisingRights')}</h3>
            <p className="text-gray-700 mb-4">{t('terms.dataProtection.contactInfo')}</p>
          </section>

          {/* Contact Information */}
          <section className="mb-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('terms.contact.title')}</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>{t('terms.contact.company')}:</strong> EXPLOR TUR S.R.L.
              </p>
              <p className="text-gray-700">
                <strong>{t('terms.contact.address')}:</strong> MD-2004, mun. Chişinău, sec. Centru, str. 31 August 1989, 64
              </p>
              <p className="text-gray-700">
                <strong>{t('terms.contact.email')}:</strong> aviatickets.ro
              </p>
            </div>
          </section>

          {/* Last Updated */}
          <section className="text-sm text-gray-500 text-center border-t border-gray-200 pt-6">
            <p>{t('terms.lastUpdated')}</p>
          </section>

        </div>
      </div>
    </div>
  );
}