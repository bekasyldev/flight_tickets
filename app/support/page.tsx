'use client';

import React from 'react';
import { Mail, MessageCircle, Clock } from 'lucide-react';
import Header from '../components/Header';
import { useTranslation } from '../lib/i18n';

export default function SupportPage() {
  const { t } = useTranslation();


  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 pb-8">
        <main className="flex flex-col items-center justify-center px-4 pt-12">
          <div className="text-center mb-12">

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t('support.title', 'Need Help?')}
            </h1>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              {t('support.subtitle', "We're here to help you with any questions or issues you might encounter while booking your flights.")}
            </p>
          </div>

          {/* Support Cards */}
          <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 mb-8">
            {/* Email Support Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('support.emailSupport', 'Email Support')}
                </h2>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t('support.emailDescription', 'Send us an email with your questions, booking issues, or technical problems. We typically respond within 24 hours.')}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <a 
                    href="mailto:avelrusimport@gmail.com"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    avelrusimport@gmail.com
                  </a>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    {t('support.responseTime', 'Response time: 24 hours')}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => window.location.href = 'mailto:avelrusimport@gmail.com'}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-colors duration-200"
              >
                {t('support.sendEmail', 'Send Email')}
              </button>
            </div>

            {/* Common Issues Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('support.commonIssues', 'Common Issues')}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('support.bookingIssues', 'Booking Problems')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('support.bookingIssuesDesc', 'Payment failures, confirmation emails, seat selection issues')}
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('support.technicalIssues', 'Technical Issues')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('support.technicalIssuesDesc', 'Website errors, loading problems, mobile app issues')}
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('support.accountIssues', 'Account Issues')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('support.accountIssuesDesc', 'Login problems, password reset, profile updates')}
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('support.refundIssues', 'Refunds & Changes')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('support.refundIssuesDesc', 'Flight cancellations, date changes, refund requests')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Banner */}
          <div className="w-full max-w-4xl bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              {t('support.urgentIssues', 'Urgent Issues?')}
            </h3>
            <p className="text-white/90 mb-4">
              {t('support.urgentDescription', 'For urgent travel-related issues or last-minute problems, contact us immediately.')}
            </p>
            <a 
              href="mailto:avelrusimport@gmail.com?subject=URGENT: Flight Support Request"
              className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-xl font-medium transition-colors duration-200"
            >
              <Mail className="w-5 h-5 mr-2" />
              {t('support.urgentEmail', 'Send Urgent Email')}
            </a>
          </div>
        </main>
      </div>

      {/* Additional Help Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('support.beforeContacting', 'Before Contacting Us')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('support.beforeContactingDesc', 'To help us assist you better, please have the following information ready when contacting support.')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('support.bookingDetails', 'Booking Details')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('support.bookingDetailsDesc', 'Your booking reference, flight dates, and passenger information')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-orange-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('support.errorDetails', 'Error Details')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('support.errorDetailsDesc', 'Screenshots of error messages and description of what you were trying to do')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('support.deviceInfo', 'Device Information')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('support.deviceInfoDesc', 'Your browser type, device model, and operating system version')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
