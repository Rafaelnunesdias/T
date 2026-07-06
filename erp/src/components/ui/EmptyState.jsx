import { PackageSearch, ClipboardList, TrendingUp, Users, Truck } from 'lucide-react'
import './EmptyState.css'

const illustrations = {
  orders: ClipboardList,
  stock: PackageSearch,
  financial: TrendingUp,
  clients: Users,
  deliveries: Truck,
}

export default function EmptyState({
  icon = 'orders',
  title,
  description,
  action,
  className = '',
}) {
  const Icon = illustrations[icon] || illustrations.orders

  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-illustration">
        <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="20" y1="70" x2="100" y2="70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          {icon === 'orders' && (
            <>
              <rect x="35" y="25" width="50" height="38" rx="4" stroke="#FC6901" strokeWidth="1.5" fill="none" />
              <line x1="45" y1="38" x2="75" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              <line x1="45" y1="46" x2="65" y2="46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
              <circle cx="60" cy="58" r="3" fill="#FC6901" opacity="0.6" />
              <path d="M60 55v6M57 58h6" stroke="#FC6901" strokeWidth="1.2" strokeLinecap="round" />
            </>
          )}
          {icon === 'stock' && (
            <>
              <rect x="30" y="30" width="25" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
              <rect x="65" y="25" width="25" height="25" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
              <rect x="47" y="40" width="25" height="20" rx="2" stroke="#FC6901" strokeWidth="1.5" fill="none" />
              <line x1="47" y1="48" x2="72" y2="48" stroke="#FC6901" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            </>
          )}
          {icon === 'financial' && (
            <>
              <path d="M30 55 L45 40 L60 45 L75 30 L90 35" stroke="#FC6901" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="75" cy="30" r="8" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3" />
              <path d="M72 30h6M75 27v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
            </>
          )}
          {icon === 'clients' && (
            <>
              <circle cx="48" cy="35" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
              <path d="M32 65c0-10 7-18 16-18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              <circle cx="72" cy="30" r="8" stroke="#FC6901" strokeWidth="1.5" fill="none" />
              <line x1="69" y1="30" x2="75" y2="30" stroke="#FC6901" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="72" y1="27" x2="72" y2="33" stroke="#FC6901" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M62 58c0-8 4-14 10-14" stroke="#FC6901" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {icon === 'deliveries' && (
            <>
              <rect x="25" y="40" width="20" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
              <path d="M50 40h20l8 12v12H50V40z" stroke="#FC6901" strokeWidth="1.5" fill="none" />
              <circle cx="38" cy="62" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
              <circle cx="72" cy="62" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
              <path d="M55 51l-3 3 6 6" stroke="#FC6901" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
        </svg>
      </div>
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}
