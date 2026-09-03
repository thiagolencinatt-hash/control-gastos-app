"use client";

import { useState } from "react";
import { Plus, Wallet, Building2, Smartphone, TrendingUp, Bitcoin, MoreHorizontal, Edit3 } from "lucide-react";
import type { Account, AccountType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";
import { AccountForm } from "@/components/accounts/AccountForm";

const accountIcons: Record<AccountType, React.ElementType> = {
  cash: Wallet,
  bank: Building2,
  digital_wallet: Smartphone,
  investment: TrendingUp,
  crypto: Bitcoin,
  other: MoreHorizontal,
};

interface AccountsGridProps {
  accounts: Account[];
  onRefresh: () => void;
}

export function AccountsGrid({ accounts, onRefresh }: AccountsGridProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  function handleEditAccount(account: Account) {
    setSelectedAccount(account);
    setShowForm(true);
  }

  function handleNewAccount() {
    setSelectedAccount(null);
    setShowForm(true);
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: "hsl(var(--foreground))" }}>
              Mis cuentas & Saldos
            </h2>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              Tocá cualquier cuenta para editar su saldo o datos
            </p>
          </div>
          <button
            onClick={handleNewAccount}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-black gradient-primary btn-3d cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva cuenta
          </button>
        </div>

        {accounts.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center border-2 border-dashed glass"
            style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
          >
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30 text-primary" />
            <p className="text-sm font-medium mb-1">Sin cuentas todavía</p>
            <p className="text-xs opacity-70">Agregá tu primera billetera o banco para empezar</p>
            <button
              onClick={handleNewAccount}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-black gradient-primary btn-3d"
            >
              Agregar cuenta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {accounts.map((account) => {
              const Icon = accountIcons[account.type] || Wallet;
              return (
                <div
                  key={account.id}
                  onClick={() => handleEditAccount(account)}
                  className="rounded-2xl p-4 flex flex-col justify-between card-hover cursor-pointer relative group transition-all"
                  style={{
                    background: `${account.color}15`,
                    border: `1px solid ${account.color}35`,
                  }}
                  title="Clic para editar saldo o datos de esta cuenta"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                      style={{ background: `${account.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: account.color }} />
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/40 text-primary">
                      <Edit3 className="w-3 h-3" /> Editar
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-semibold truncate opacity-80" style={{ color: "hsl(var(--foreground))" }}>
                      {account.name}
                    </p>
                    <p className="text-base font-extrabold mt-0.5 tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
                      {formatCurrency(account.balance, account.currency, true)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{ background: `${account.color}25`, color: account.color }}
                      >
                        {account.currency}
                      </span>
                      <span className="text-[10px] opacity-60">Tocar para cambiar</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add account button */}
            <button
              onClick={handleNewAccount}
              className="rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all border-2 border-dashed glass hover:border-primary cursor-pointer group"
              style={{
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 group-hover:bg-primary/20 transition-colors">
                <Plus className="w-5 h-5 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs font-semibold group-hover:text-primary transition-colors">Agregar cuenta</span>
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <AccountForm
          isOpen={showForm}
          account={selectedAccount}
          onClose={() => {
            setShowForm(false);
            setSelectedAccount(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedAccount(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
