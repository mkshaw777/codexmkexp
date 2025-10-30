import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  label?: string;
}

export default function BalanceCard({ balance, label = 'Current Balance' }: BalanceCardProps) {
  const getBalanceIndicator = () => {
    if (balance > 0) {
      return {
        icon: <ArrowUp className="w-5 h-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Positive',
      };
    } else if (balance < 0) {
      return {
        icon: <ArrowDown className="w-5 h-5" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Negative',
      };
    } else {
      return {
        icon: <Minus className="w-5 h-5" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        label: 'Zero',
      };
    }
  };

  const indicator = getBalanceIndicator();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={indicator.color}>₹{Math.abs(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{indicator.label} Balance</p>
          </div>
          <div className={`${indicator.bgColor} ${indicator.color} p-3 rounded-full`}>
            {indicator.icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
