'use client'

import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { FINANCE_GROUPS } from '@/config/finance-menu'

const group = FINANCE_GROUPS.find(g => g.id === 'closing-reports')!

export default function ClosingReportsPage() {
  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={group.label}
          description={group.description}
          breadcrumbs={[
            { label: 'Finance', href: '/finance' },
            { label: group.label },
          ]}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.items.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                    <HugeiconsIcon icon={item.icon} className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <BookmarkToggle itemId={item.id} size="sm" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
                <div className="mt-4">
                  <Link href={item.href}>
                    <Button variant="outline" size="sm" className="w-full">
                      Open {item.label}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
