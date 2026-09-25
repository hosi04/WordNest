import { useI18n } from '../../i18n/I18nContext'
import { LanguageSwitch } from '../../i18n/LanguageSwitch'
import { SettingsSection } from './SettingsSection'

export function LanguageSection() {
  const { t } = useI18n()
  return (
    <SettingsSection title={t.settings.language.title} description={t.settings.language.description}>
      <LanguageSwitch />
    </SettingsSection>
  )
}
