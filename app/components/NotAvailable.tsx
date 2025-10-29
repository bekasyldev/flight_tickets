'use client';

import Image from 'next/image';
import { useTranslation } from '../lib/i18n';

export default function NotAvailable() {
    const { t } = useTranslation();

    return (
        <div className="p-4  rounded flex items-center">
            <div className="flex-1 pl-20">
                <h2 className="text-lg font-semibold mb-2">{t('notAvailable.title')}</h2>
                <p>
                    {t('notAvailable.description')}
                </p>
                <button className="bg-orange-400  rounded-2xl mt-4 text-white py-2 px-4" onClick={() => {window.history.back();}}>
                    {t('notAvailable.backToSearch')}
                </button>
            </div>
            <div className="ml-6">
                <Image 
                    src="/notavailable.png" 
                    alt={t('notAvailable.imageAlt')} 
                    width={400}
                    height={500}
                />
            </div>
        </div>
    );
}
