'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SavingsPlanForm } from '@/components/forms/SavingsPlanForm'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { useSavingsPlans } from '@/hooks/useSavingsPlans'
import { createSavingsPlan, createTransaction } from '@/lib/api'
import type { NewSavingsPlan, NewTransaction } from '@/types'

export default function AhorroPage() {
  const { plans, mutate } = useSavingsPlans()
  const [newPlanOpen, setNewPlanOpen] = useState(false)
  const [contributingPlanId, setContributingPlanId] = useState<number | null>(null)

  const handleCreatePlan = async (data: NewSavingsPlan) => {
    await createSavingsPlan(data)
    await mutate()
    setNewPlanOpen(false)
  }

  const handleContribution = async (data: NewTransaction) => {
    await createTransaction(data)
    await mutate()
    setContributingPlanId(null)
  }

  const contributingPlan = plans.find(p => p.id === contributingPlanId)

  const getDaysRemaining = (deadline: string | null): string | null => {
    if (!deadline) return null
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
    if (days < 0) return 'Vencido'
    if (days === 0) return 'Hoy'
    return `${days} días restantes`
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-xl font-bold">Planes de ahorro</h1>
        <button onClick={() => setNewPlanOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--accent)' }}>
          <Plus size={16} /> Nuevo plan
        </button>
      </div>

      {plans.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>No tienes planes de ahorro aún</p>
          <button onClick={() => setNewPlanOpen(true)}
            className="px-5 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}>
            Crear primer plan
          </button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plans.map(plan => {
            const target = parseFloat(plan.targetAmount)
            const daysRemaining = getDaysRemaining(plan.deadline)

            return (
              <Card key={plan.id} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{plan.name}</h3>
                      <Badge variant={plan.type} />
                    </div>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      ${plan.savedAmount.toFixed(2)} de ${target.toFixed(2)}
                      {daysRemaining && (
                        <span className="ml-2 text-xs" style={{ color: daysRemaining === 'Vencido' ? 'var(--danger)' : 'rgba(255,255,255,0.4)' }}>
                          · {daysRemaining}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setContributingPlanId(plan.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white flex-shrink-0"
                    style={{ background: 'rgba(167,139,250,0.25)', color: 'var(--accent)' }}
                  >
                    + Contribuir
                  </button>
                </div>
                <ProgressBar
                  percent={plan.progressPercent}
                  sublabel={`$${plan.savedAmount.toFixed(2)} / $${target.toFixed(2)}`}
                />
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={newPlanOpen} onClose={() => setNewPlanOpen(false)} title="Nuevo plan de ahorro">
        <SavingsPlanForm onSubmit={handleCreatePlan} onCancel={() => setNewPlanOpen(false)} />
      </Modal>

      <Modal
        isOpen={contributingPlanId !== null}
        onClose={() => setContributingPlanId(null)}
        title={`Contribuir a: ${contributingPlan?.name ?? ''}`}
      >
        {contributingPlan && (
          <TransactionForm
            onSubmit={handleContribution}
            onCancel={() => setContributingPlanId(null)}
            defaultSavingsPlanId={contributingPlan.id}
          />
        )}
      </Modal>
    </div>
  )
}
