import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryCards from './components/SummaryCards';
import ExpenseChart from './components/ExpenseChart';
import type { Transaction, TransactionInput } from './types/transaction';
import { DollarSign } from 'lucide-react';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', DEMO_USER_ID)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (input: TransactionInput) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: DEMO_USER_ID,
            ...input,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTransactions([data, ...transactions]);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <DollarSign className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Personal Finance Tracker</h1>
          </div>
          <p className="text-gray-600">Track your income and expenses with ease</p>
        </div>

        <SummaryCards transactions={transactions} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <TransactionForm onSubmit={handleAddTransaction} />
          </div>
          <div className="lg:col-span-2">
            <ExpenseChart transactions={transactions} />
          </div>
        </div>

        <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
      </div>
    </div>
  );
}

export default App;
