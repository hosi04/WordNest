import { PlaceholderPage } from '../components/PlaceholderPage'
import { useI18n } from '../i18n/I18nContext'

export function StatsPage() {
  const { t } = useI18n()
  return <PlaceholderPage title={t.nav.stats} message={t.stats.placeholder} />
}
