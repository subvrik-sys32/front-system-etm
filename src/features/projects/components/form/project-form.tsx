"use client"

import {
  FolderKanban,
  Settings2,
  Users,
} from "lucide-react"

import { Input } from "@/components/ui/input"

import { FormSection } from "@/shared/ui/dialogs/form-dialog/form-section"
import { FormField } from "@/shared/ui/dialogs/form-dialog/form-field"

import { EntitySelect } from "@/shared/ui/entity-select/entity-select"

import { UserSelect } from "@/features/users/components/user-select"

import { useUsers } from "@/features/users/hooks/use-users"
import { useClients } from "@/features/clients/hooks/use-clients"
import { useStages } from "@/features/stages/hooks/use-stages"
import { useStatuses } from "@/features/statuses/hooks/use-statuses"

type Form = {
  projectCode: string
  name: string
  clientId: string
  pmId: string
  stageId: string
  statusId: string
  deliveryDate: string | null
}

type Props = {
  form: Form
  update: (value: Partial<Form>) => void
}

export function ProjectForm({ form, update }: Props) {

  const { clients, create, update: updateClient, remove: removeClient } = useClients()
  const { stages, create: createStage, update: updateStage, remove: removeStage } = useStages()
  const { statuses, create: createStatus, update: updateStatus, remove: removeStatus } = useStatuses()
  const { users } = useUsers()

  const pms = users.filter(
    (u) => u.role?.code === "PROJECT_MANAGER"
  )

  const selectedClient = clients.find((i) => i.id === form.clientId)
  const selectedStage = stages.find((i) => i.id === form.stageId)
  const selectedStatus = statuses.find((i) => i.id === form.statusId)
  const selectedPm = pms.find((i) => i.id === form.pmId)

  return (
    <div className="space-y-3">

      <FormSection title="Información principal" icon={FolderKanban}>
        <div className="grid grid-cols-2 gap-4">

          <FormField label="Código de proyecto *">
            <Input
              value={form.projectCode}
              placeholder="26-001-M"
              onChange={(e) =>
                update({ projectCode: e.target.value.toUpperCase() })
              }
            />
          </FormField>

          <FormField label="Nombre de proyecto *">
            <Input
              value={form.name}
              placeholder="TABLERO AUTOSOPORTADO - TTA"
              onChange={(e) =>
                update({ name: e.target.value.toUpperCase() })
              }
            />
          </FormField>

        </div>
      </FormSection>

      <FormSection title="Relaciones" icon={Users}>
        <div className="grid grid-cols-2 gap-4">

          <FormField label="Cliente *">
            <EntitySelect
              collection="clients"
              value={selectedClient}
              items={clients}
              placeholder="Cliente"
              onChange={(v) =>
                update({ clientId: v?.id ?? "" })
              }
              onCreate={create}
              onEdit={updateClient}
              onDelete={removeClient}
            />
          </FormField>

          <FormField label="Project Manager *">
            <UserSelect
              value={selectedPm}
              items={pms}
              placeholder="PM"
              onChange={(v) =>
                update({ pmId: v?.id ?? "" })
              }
            />
          </FormField>

        </div>
      </FormSection>

      <FormSection title="Control" icon={Settings2}>
        <div className="grid grid-cols-3 gap-4">

          <FormField label="Etapa *">
            <EntitySelect
              collection="stages"
              value={selectedStage}
              items={stages}
              placeholder="Etapa"
              onChange={(v) =>
                update({ stageId: v?.id ?? "" })
              }
              onCreate={createStage}
              onEdit={updateStage}
              onDelete={removeStage}
            />
          </FormField>

          <FormField label="Estado *">
            <EntitySelect
              collection="statuses"
              value={selectedStatus}
              items={statuses}
              placeholder="Estado"
              onChange={(v) =>
                update({ statusId: v?.id ?? "" })
              }
              onCreate={createStatus}
              onEdit={updateStatus}
              onDelete={removeStatus}
            />
          </FormField>

          <FormField label="Fecha de entrega *">
            <Input
              type="date"
              value={form.deliveryDate ?? ""}
              onChange={(e) =>
                update({ deliveryDate: e.target.value })
              }
              className="[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:invert"
            />
          </FormField>

        </div>
      </FormSection>

    </div>
  )
}