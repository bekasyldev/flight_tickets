'use client';

import Image from 'next/image';
import { useTranslation } from '../lib/i18n';

export default function NotAvailable() {
    const { t } = useTranslation();

    return (
        <div className="rounded flex items-center p-10 gap-20">
            <div className="flex-1 pl-20 max-w-xl space-y-6">
                <h2 className="text-2xl font-semibold mb-2">{t('notAvailable.title')}</h2>
                <p>
                    {t('notAvailable.description')}
                </p>
                <button className="bg-orange-400 font-semibold  rounded-2xl mt-4 text-white py-2 px-4" onClick={() => {window.history.back();}}>
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
