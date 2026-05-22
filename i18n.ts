import {getRequestConfig} from 'next-intl/server';

const locales = ['pl', 'en', 'it'] as const;
const defaultLocale = 'pl';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = locales.includes(requested as typeof locales[number])
    ? (requested as string)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
