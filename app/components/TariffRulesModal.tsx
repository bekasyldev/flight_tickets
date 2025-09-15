'use client';

import React from 'react';
import { useTranslation } from '../lib/i18n';

interface TariffRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  flightRoute?: string;
}

export default function TariffRulesModal({ isOpen, onClose, flightRoute }: TariffRulesModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {t('tariffRules.title')}
              </h2>
              {flightRoute && (
                <p className="text-blue-100 mt-1">
                  {flightRoute}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Booking Rules Section */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('tariffRules.bookingRules.title')}
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                {t('tariffRules.bookingRules.features.title')}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                <li>{t('tariffRules.bookingRules.features.noPower')}</li>
                <li>{t('tariffRules.bookingRules.features.handBaggageOnly')}</li>
                <li>{t('tariffRules.bookingRules.features.noExchange')}</li>
                <li>{t('tariffRules.bookingRules.features.noSeatSelection')}</li>
              </ul>
            </div>
          </section>

          {/* Cancellation and Changes */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('tariffRules.cancellation.title')}
            </h3>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t('tariffRules.cancellation.before24h.title')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('tariffRules.cancellation.before24h.description')}
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t('tariffRules.cancellation.after24h.title')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('tariffRules.cancellation.after24h.description')}
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t('tariffRules.cancellation.noShow.title')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('tariffRules.cancellation.noShow.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Baggage Rules */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('tariffRules.baggage.title')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t('tariffRules.baggage.handBaggage.title')}
                </h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• {t('tariffRules.baggage.handBaggage.weight')}</li>
                  <li>• {t('tariffRules.baggage.handBaggage.dimensions')}</li>
                  <li>• {t('tariffRules.baggage.handBaggage.included')}</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t('tariffRules.baggage.checkedBaggage.title')}
                </h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• {t('tariffRules.baggage.checkedBaggage.notIncluded')}</li>
                  <li>• {t('tariffRules.baggage.checkedBaggage.additionalFee')}</li>
                  <li>• {t('tariffRules.baggage.checkedBaggage.airlineRules')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Additional Services */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('tariffRules.additionalServices.title')}
            </h3>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• {t('tariffRules.additionalServices.seatSelection')}</li>
                <li>• {t('tariffRules.additionalServices.meals')}</li>
                <li>• {t('tariffRules.additionalServices.priorityBoarding')}</li>
                <li>• {t('tariffRules.additionalServices.insurance')}</li>
              </ul>
            </div>
          </section>

          {/* Important Notes */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('tariffRules.importantNotes.title')}
            </h3>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="space-y-2 text-red-800 text-sm">
                <li>• {t('tariffRules.importantNotes.nameChange')}</li>
                <li>• {t('tariffRules.importantNotes.documentation')}</li>
                <li>• {t('tariffRules.importantNotes.checkinTime')}</li>
                <li>• {t('tariffRules.importantNotes.airlineRules')}</li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('tariffRules.contact.title')}
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm mb-2">
                {t('tariffRules.contact.helpText')}
              </p>
              <div className="text-blue-700 text-sm">
                <p><strong>{t('tariffRules.contact.email')}:</strong> Aviagrand2025@gmail.com</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('tariffRules.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}