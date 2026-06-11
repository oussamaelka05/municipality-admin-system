import { FileSearch } from 'lucide-react'

export default function EmptyState({ message = 'No data found', icon: Icon = FileSearch, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
      <Icon size={40} strokeWidth={1.2} />
      <p className="text-sm">{message}</p>
      {action}
    </div>
  )
}
