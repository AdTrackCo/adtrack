import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { generateRoasTrend } from '@/lib/mockData'

const data = generateRoasTrend()

export function RoasTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#9490A8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#9490A8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#18181F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#9490A8' }}
        />
        <Line type="monotone" dataKey="previous" stroke="#2AFFD3" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Previous period" />
        <Line type="monotone" dataKey="current" stroke="#7C5CFC" strokeWidth={2.5} dot={false} name="Current period" />
      </LineChart>
    </ResponsiveContainer>
  )
}
