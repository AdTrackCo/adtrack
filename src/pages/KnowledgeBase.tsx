import { useState } from 'react'
import { Search, BookOpen, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SampleDataBanner } from '@/components/common/SampleDataBanner'

const guides = [
  'Naming Convention Guide',
  'Creative Testing Frameworks',
  'Meta Algorithm 101',
  'Budget Scaling Rules',
  'How to Diagnose Low ROAS',
  'Hook Formula Library (30+ Templates)',
  'Funnel Stage Strategies (TOFU/MOFU/BOFU)',
  'Platform-Specific Best Practices',
]

const templates = ['Campaign Brief Template', 'Creative Brief Template', 'Weekly Review Agenda', 'Ad Copy Swipe File']

export function KnowledgeBase() {
  const [search, setSearch] = useState('')
  const filteredGuides = guides.filter((g) => g.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader title="Knowledge Base" description="Playbooks, frameworks, and your own saved learnings." />

      <SampleDataBanner>
        These are planned guide and template titles — none of them have content written yet, so the cards aren't
        clickable. Search filters the titles only.
      </SampleDataBanner>

      <div className="p-6 md:p-8 space-y-6">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <Input placeholder="Search the knowledge base…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Guides</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredGuides.map((g) => (
              <Card key={g} className="p-4 opacity-60">
                <BookOpen size={16} className="text-[var(--color-violet)] mb-2.5" />
                <p className="text-xs font-medium leading-relaxed">{g}</p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Templates</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {templates.map((t) => (
              <Card key={t} className="p-4 opacity-60">
                <FileText size={16} className="text-[var(--color-teal)] mb-2.5" />
                <p className="text-xs font-medium leading-relaxed">{t}</p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Your Saved Learnings</p>
          <Card className="p-5">
            <p className="text-xs text-[var(--color-text-secondary)]">
              Learnings you save from the Testing Lab will show up here, searchable alongside the built-in guides.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
