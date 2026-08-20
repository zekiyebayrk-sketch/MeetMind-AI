import Header from '../components/layout/Header'
import SectionCard from '../components/common/SectionCard'
import SettingsRow from '../components/common/SettingsRow'
import ThemeToggle from '../components/common/ThemeToggle'
import { SettingsIcon, UsersIcon, DocumentTextIcon } from '../components/common/icons'

function Settings() {
  return (
    <div className="flex flex-col gap-8">
      <Header title="Settings" subtitle="Manage how MeetMind AI looks and works for you." />

      <SectionCard
        icon={SettingsIcon}
        title="Appearance"
        material="medium"
        bodyClassName="divide-y divide-border/40"
      >
        <SettingsRow
          icon={SettingsIcon}
          label="Theme"
          description="Choose how MeetMind AI looks on this device."
          control={<ThemeToggle />}
        />
      </SectionCard>

      <SectionCard
        icon={UsersIcon}
        title="Account"
        material="medium"
        bodyClassName="divide-y divide-border/40"
      >
        <SettingsRow icon={UsersIcon} label="Zekiye Bayrak" description="zekiyebayrk@gmail.com" />
      </SectionCard>

      <SectionCard
        icon={DocumentTextIcon}
        title="About"
        material="medium"
        bodyClassName="divide-y divide-border/40"
      >
        <SettingsRow label="Version" description="MeetMind AI 1.0" />
      </SectionCard>
    </div>
  )
}

export default Settings
