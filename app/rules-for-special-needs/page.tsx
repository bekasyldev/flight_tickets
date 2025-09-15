'use client';

import React from 'react';
import Header from '../components/Header';
import { useTranslation } from '../lib/i18n';

export default function SpecialNeedsRulesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('specialNeeds.title')}
          </h1>
          <p className="text-blue-100 text-lg">
            {t('specialNeeds.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-gray-800">
          
          {/* Passengers with Limited Mobility Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('specialNeeds.limitedMobility.title')}
            </h2>
            
            <div className="prose prose-gray max-w-none">
              <p className="mb-4">
                {t('specialNeeds.limitedMobility.servicesInfo')}
              </p>
              
              <p className="mb-4">
                {t('specialNeeds.limitedMobility.supplierConditions')}
              </p>
              
              <p className="mb-4">
                {t('specialNeeds.limitedMobility.contractInfo')}
              </p>
              
              <p className="mb-4">
                {t('specialNeeds.limitedMobility.carrierRights')}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  {t('specialNeeds.limitedMobility.acceptanceFactors.title')}
                </h3>
                <ul className="list-disc list-inside space-y-2 text-blue-800">
                  <li>{t('specialNeeds.limitedMobility.acceptanceFactors.handlingCapability')}</li>
                  <li>{t('specialNeeds.limitedMobility.acceptanceFactors.limitations')}</li>
                  <li>{t('specialNeeds.limitedMobility.acceptanceFactors.comfortFactors')}</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">
                  {t('specialNeeds.limitedMobility.timeRequirement.title')}
                </h3>
                <p className="text-orange-800">
                  {t('specialNeeds.limitedMobility.timeRequirement.description')}
                </p>
              </div>
              
              <p className="mb-4">
                {t('specialNeeds.limitedMobility.medicalRequirements')}
              </p>
              
              <p className="mb-6">
                {t('specialNeeds.limitedMobility.medifFormInfo')}
              </p>
            </div>
          </section>

          {/* Wheelchair Categories Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('specialNeeds.wheelchairCategories.title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  {t('specialNeeds.wheelchairCategories.wchr.title')}
                </h3>
                <p className="text-green-800 text-sm">
                  {t('specialNeeds.wheelchairCategories.wchr.description')}
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  {t('specialNeeds.wheelchairCategories.wchs.title')}
                </h3>
                <p className="text-yellow-800 text-sm">
                  {t('specialNeeds.wheelchairCategories.wchs.description')}
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  {t('specialNeeds.wheelchairCategories.wchc.title')}
                </h3>
                <p className="text-red-800 text-sm">
                  {t('specialNeeds.wheelchairCategories.wchc.description')}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('specialNeeds.wheelchairTransport.title')}
              </h3>
              <p className="text-gray-700 mb-3">
                {t('specialNeeds.wheelchairTransport.wheelchairInfo')}
              </p>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t('specialNeeds.wheelchairTransport.electricWheelchairs.title')}
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>{t('specialNeeds.wheelchairTransport.electricWheelchairs.spillProof')}</li>
                  <li>{t('specialNeeds.wheelchairTransport.electricWheelchairs.wetLithium')}</li>
                </ul>
              </div>
              
              <p className="text-gray-700">
                {t('specialNeeds.wheelchairTransport.freeTransport')}
              </p>
            </div>
          </section>

          {/* Sensory Impairments Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('specialNeeds.sensoryImpairments.title')}
            </h2>
            
            <div className="prose prose-gray max-w-none">
              <p className="mb-4">
                {t('specialNeeds.sensoryImpairments.bookingNotification')}
              </p>
              
              <p className="mb-4">
                {t('specialNeeds.sensoryImpairments.medicalCertificate')}
              </p>
              
              <p className="mb-4">
                {t('specialNeeds.sensoryImpairments.multipleSensory')}
              </p>
              
              <p className="mb-6">
                {t('specialNeeds.sensoryImpairments.seatingPreferences')}
              </p>
            </div>
          </section>

          {/* Service Animals Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('specialNeeds.serviceAnimals.title')}
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 mb-4">
                {t('specialNeeds.serviceAnimals.introduction')}
              </p>
              
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                {t('specialNeeds.serviceAnimals.conditions.title')}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-blue-800">
                <li>{t('specialNeeds.serviceAnimals.conditions.weightSize')}</li>
                <li>{t('specialNeeds.serviceAnimals.conditions.certificate')}</li>
                <li>{t('specialNeeds.serviceAnimals.conditions.noPlaneTravel')}</li>
                <li>{t('specialNeeds.serviceAnimals.conditions.noSeat')}</li>
                <li>{t('specialNeeds.serviceAnimals.conditions.muzzleLeash')}</li>
              </ul>
            </div>
          </section>

          {/* Important Notices Section */}
          <section className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-900 mb-4">
                {t('specialNeeds.importantNotices.title')}
              </h2>
              
              <div className="space-y-4 text-red-800">
                <p>
                  {t('specialNeeds.importantNotices.zborResponsibility')}
                </p>
                
                <p>
                  {t('specialNeeds.importantNotices.multipleCarriers')}
                </p>
                
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-red-900">
                    {t('specialNeeds.importantNotices.contactCarrier')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('specialNeeds.contact.title')}
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {t('specialNeeds.contact.company')}
                  </h3>
                  <p className="text-gray-600">EXPLOR TUR S.R.L.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {t('specialNeeds.contact.email')}
                  </h3>
                  <p className="text-gray-600">support@zbor.md</p>
                </div>
              </div>
            </div>
          </section>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-gray-200">
            {t('specialNeeds.lastUpdated')}
          </div>
        </div>
      </div>
    </div>
  );
}