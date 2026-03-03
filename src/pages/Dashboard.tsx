import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Package, BookOpen, ShoppingCart } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { storage } from '../services/storage';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>({});
  const [charts, setCharts] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sumData = storage.getDashboardSummary();
        const chartsData = storage.getDashboardCharts();
        
        setSummary(sumData);
        setCharts(chartsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Today Income" value={`₹${summary.todayIncome}`} icon={IndianRupee} color="text-green-600" bg="bg-green-100" />
        <Card title="Today Expenses" value={`₹${summary.todayExpenses}`} icon={TrendingDown} color="text-red-600" bg="bg-red-100" />
        <Card title="Monthly Profit" value={`₹${summary.monthlyProfit}`} icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-100" />
        <Card title="Monthly Purchases" value={`₹${summary.monthlyPurchases}`} icon={ShoppingCart} color="text-orange-600" bg="bg-orange-100" />
        <Card title="Inventory Value" value={`₹${summary.inventoryValue}`} icon={Package} color="text-blue-600" bg="bg-blue-100" />
        <Card title="Pending Udhar" value={`₹${summary.pendingUdhar}`} icon={BookOpen} color="text-purple-600" bg="bg-purple-100" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses vs Purchases (Monthly) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                <Bar dataKey="purchases" fill="#F59E0B" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Last 30 Days Income Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Last 30 Days Income</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.last30DaysIncome}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} name="Income" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Distribution</h3>
          <div className="h-80 flex justify-center">
            {charts.expenseDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.expenseDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {charts.expenseDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No expense data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`rounded-md p-3 ${bg}`}>
              <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
