'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Zap,
  Plus,
  Eye,
  Edit,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Search,
  Building,
  Globe,
  Star,
  Users,
  DollarSign,
  BarChart3,
  MapPin,
  Calendar,
  Crown
} from 'lucide-react'
import Link from 'next/link'

// Competitor types
interface Competitor {
  id: string
  company_name: string
  brand_name: string
  company_type: 'local' | 'national' | 'international' | 'online_only'
  market_position: 'leader' | 'challenger' | 'follower' | 'niche'
  business_model: 'b2c' | 'b2b' | 'hybrid'
  headquarters: string
  website?: string
  founded_year: number
  estimated_revenue: number
  market_share_percentage: number
  employee_count: number
  store_count: number
  online_presence_score: number
  product_similarity_score: number
  price_competitiveness: 'higher' | 'similar' | 'lower'
  strengths: string[]
  weaknesses: string[]
  threat_level: 'low' | 'medium' | 'high' | 'critical'
  monitoring_status: 'active' | 'passive' | 'discontinued'
  last_analysis_date: string
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

const mockCompetitors: Competitor[] = [
  {
    id: '1',
    company_name: 'Bata Indonesia',
    brand_name: 'Bata',
    company_type: 'national',
    market_position: 'leader',
    business_model: 'hybrid',
    headquarters: 'Jakarta, Indonesia',
    website: 'https://www.bata.com',
    founded_year: 1894,
    estimated_revenue: 2500000000000,
    market_share_percentage: 28.5,
    employee_count: 15000,
    store_count: 850,
    online_presence_score: 85,
    product_similarity_score: 92,
    price_competitiveness: 'similar',
    strengths: ['Brand recognition', 'Extensive store network', 'Wide product range', 'Strong distribution'],
    weaknesses: ['Traditional image', 'Limited premium segment', 'Slow digital adoption'],
    threat_level: 'critical',
    monitoring_status: 'active',
    last_analysis_date: '2024-07-20T10:30:00Z',
    created_by: 'Market Research Team',
    updated_by: 'Ahmad Research',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-07-25T14:45:00Z'
  },
  {
    id: '2',
    company_name: 'Nike Indonesia',
    brand_name: 'Nike',
    company_type: 'international',
    market_position: 'leader',
    business_model: 'b2c',
    headquarters: 'Beaverton, USA',
    website: 'https://www.nike.com',
    founded_year: 1964,
    estimated_revenue: 5600000000000,
    market_share_percentage: 22.1,
    employee_count: 79000,
    store_count: 156,
    online_presence_score: 98,
    product_similarity_score: 45,
    price_competitiveness: 'higher',
    strengths: ['Premium brand', 'Innovation', 'Strong marketing', 'Global presence'],
    weaknesses: ['High prices', 'Limited formal shoes', 'Focus on sports'],
    threat_level: 'high',
    monitoring_status: 'active',
    last_analysis_date: '2024-07-18T15:20:00Z',
    created_by: 'Strategic Planning',
    updated_by: 'Sari Strategy',
    created_at: '2024-01-10T11:30:00Z',
    updated_at: '2024-07-24T16:15:00Z'
  },
  {
    id: '3',
    company_name: 'Adidas Indonesia',
    brand_name: 'Adidas',
    company_type: 'international',
    market_position: 'challenger',
    business_model: 'b2c',
    headquarters: 'Herzogenaurach, Germany',
    website: 'https://www.adidas.com',
    founded_year: 1949,
    estimated_revenue: 4200000000000,
    market_share_percentage: 18.7,
    employee_count: 59000,
    store_count: 134,
    online_presence_score: 94,
    product_similarity_score: 38,
    price_competitiveness: 'higher',
    strengths: ['Strong brand', 'Innovation', 'Sports partnerships', 'Style leadership'],
    weaknesses: ['Premium pricing', 'Limited business shoes', 'Sport focus'],
    threat_level: 'high',
    monitoring_status: 'active',
    last_analysis_date: '2024-07-17T12:45:00Z',
    created_by: 'Market Research Team',
    updated_by: 'Budi Research',
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-07-23T11:30:00Z'
  },
  {
    id: '4',
    company_name: 'Yongki Komaladi',
    brand_name: 'Yongki Komaladi',
    company_type: 'local',
    market_position: 'challenger',
    business_model: 'b2c',
    headquarters: 'Jakarta, Indonesia',
    website: 'https://www.yongkikomaladi.com',
    founded_year: 1978,
    estimated_revenue: 450000000000,
    market_share_percentage: 8.3,
    employee_count: 2500,
    store_count: 180,
    online_presence_score: 72,
    product_similarity_score: 88,
    price_competitiveness: 'similar',
    strengths: ['Local brand understanding', 'Fashion focus', 'Female segment', 'Design innovation'],
    weaknesses: ['Limited male segment', 'Smaller scale', 'Regional presence'],
    threat_level: 'medium',
    monitoring_status: 'active',
    last_analysis_date: '2024-07-15T09:15:00Z',
    created_by: 'Competitive Intelligence',
    updated_by: 'Rina Intelligence',
    created_at: '2024-02-01T10:45:00Z',
    updated_at: '2024-07-22T13:20:00Z'
  },
  {
    id: '5',
    company_name: 'Everbest Indonesia',
    brand_name: 'Everbest',
    company_type: 'local',
    market_position: 'follower',
    business_model: 'hybrid',
    headquarters: 'Surabaya, Indonesia',
    website: 'https://www.everbest.co.id',
    founded_year: 1985,
    estimated_revenue: 320000000000,
    market_share_percentage: 6.2,
    employee_count: 1800,
    store_count: 145,
    online_presence_score: 58,
    product_similarity_score: 85,
    price_competitiveness: 'lower',
    strengths: ['Affordable pricing', 'Wide distribution', 'Value proposition', 'Local manufacturing'],
    weaknesses: ['Brand perception', 'Quality concerns', 'Limited innovation'],
    threat_level: 'medium',
    monitoring_status: 'passive',
    last_analysis_date: '2024-07-10T16:30:00Z',
    created_by: 'Market Research Team',
    updated_by: 'Dedi Research',
    created_at: '2024-02-15T12:00:00Z',
    updated_at: '2024-07-20T14:45:00Z'
  },
  {
    id: '6',
    company_name: 'Zalora Indonesia',
    brand_name: 'Zalora',
    company_type: 'online_only',
    market_position: 'challenger',
    business_model: 'b2c',
    headquarters: 'Singapore',
    website: 'https://www.zalora.co.id',
    founded_year: 2012,
    estimated_revenue: 180000000000,
    market_share_percentage: 3.8,
    employee_count: 800,
    store_count: 0,
    online_presence_score: 96,
    product_similarity_score: 65,
    price_competitiveness: 'similar',
    strengths: ['E-commerce platform', 'Wide selection', 'Convenience', 'Tech integration'],
    weaknesses: ['No physical stores', 'Delivery dependency', 'Competition from marketplaces'],
    threat_level: 'high',
    monitoring_status: 'active',
    last_analysis_date: '2024-07-12T11:20:00Z',
    created_by: 'Digital Strategy',
    updated_by: 'Lisa Digital',
    created_at: '2024-03-01T15:30:00Z',
    updated_at: '2024-07-21T09:45:00Z'
  },
  {
    id: '7',
    company_name: 'Buccheri Indonesia',
    brand_name: 'Buccheri',
    company_type: 'local',
    market_position: 'niche',
    business_model: 'b2c',
    headquarters: 'Jakarta, Indonesia',
    website: 'https://www.buccheri.co.id',
    founded_year: 1990,
    estimated_revenue: 125000000000,
    market_share_percentage: 2.1,
    employee_count: 650,
    store_count: 85,
    online_presence_score: 64,
    product_similarity_score: 78,
    price_competitiveness: 'higher',
    strengths: ['Premium positioning', 'Quality focus', 'Formal shoes expertise', 'Business segment'],
    weaknesses: ['Limited casual range', 'High prices', 'Narrow market'],
    threat_level: 'low',
    monitoring_status: 'passive',
    last_analysis_date: '2024-06-28T14:15:00Z',
    created_by: 'Product Strategy',
    updated_by: 'Ahmad Product',
    created_at: '2024-03-15T13:45:00Z',
    updated_at: '2024-07-19T16:30:00Z'
  },
  {
    id: '8',
    company_name: 'Shopee Indonesia',
    brand_name: 'Shopee',
    company_type: 'online_only',
    market_position: 'leader',
    business_model: 'b2c',
    headquarters: 'Singapore',
    website: 'https://shopee.co.id',
    founded_year: 2015,
    estimated_revenue: 890000000000,
    market_share_percentage: 15.4,
    employee_count: 4500,
    store_count: 0,
    online_presence_score: 99,
    product_similarity_score: 35,
    price_competitiveness: 'lower',
    strengths: ['Marketplace dominance', 'Wide reach', 'Competitive pricing', 'Mobile first'],
    weaknesses: ['Platform dependency', 'Quality control', 'No direct customer relationship'],
    threat_level: 'critical',
    monitoring_status: 'active',
    last_analysis_date: '2024-07-22T13:45:00Z',
    created_by: 'E-commerce Strategy',
    updated_by: 'Sari Ecommerce',
    created_at: '2024-01-20T16:20:00Z',
    updated_at: '2024-07-25T11:15:00Z'
  }
]

export default function SalesCompetitorsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [positionFilter, setPositionFilter] = useState<string>('all')
  const [threatFilter, setThreatFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatCurrency = (amount: number): string => {
    if (!mounted) return ''
    return amount.toLocaleString('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Competitors', href: '/sales/competitors' }
  ]

  // Filter competitors
  const filteredCompetitors = mockCompetitors.filter(competitor => {
    if (searchTerm && !competitor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !competitor.brand_name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (typeFilter !== 'all' && competitor.company_type !== typeFilter) return false
    if (positionFilter !== 'all' && competitor.market_position !== positionFilter) return false
    if (threatFilter !== 'all' && competitor.threat_level !== threatFilter) return false
    return true
  })

  // Sort competitors by market share (highest first)
  const sortedCompetitors = [...filteredCompetitors].sort((a, b) => b.market_share_percentage - a.market_share_percentage)

  // Summary statistics
  const summaryStats = {
    totalCompetitors: mockCompetitors.length,
    criticalThreats: mockCompetitors.filter(c => c.threat_level === 'critical').length,
    marketLeaders: mockCompetitors.filter(c => c.market_position === 'leader').length,
    activeMonitoring: mockCompetitors.filter(c => c.monitoring_status === 'active').length,
    totalMarketShare: mockCompetitors.reduce((sum, c) => sum + c.market_share_percentage, 0),
    averageRevenue: mockCompetitors.reduce((sum, c) => sum + c.estimated_revenue, 0) / mockCompetitors.length,
    averageOnlineScore: mockCompetitors.reduce((sum, c) => sum + c.online_presence_score, 0) / mockCompetitors.length
  }

  const getTypeBadge = (type: string) => {
    const config = {
      local: { variant: 'default' as const, label: 'Local', icon: Building },
      national: { variant: 'secondary' as const, label: 'National', icon: MapPin },
      international: { variant: 'outline' as const, label: 'International', icon: Globe },
      online_only: { variant: 'secondary' as const, label: 'Online Only', icon: Globe }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type, icon: Building }
  }

  const getPositionBadge = (position: string) => {
    const config = {
      leader: { variant: 'default' as const, label: 'Leader', icon: Crown },
      challenger: { variant: 'secondary' as const, label: 'Challenger', icon: TrendingUp },
      follower: { variant: 'outline' as const, label: 'Follower', icon: Users },
      niche: { variant: 'secondary' as const, label: 'Niche', icon: Star }
    }
    return config[position as keyof typeof config] || { variant: 'secondary' as const, label: position, icon: Star }
  }

  const getThreatBadge = (threat: string) => {
    const config = {
      low: { variant: 'outline' as const, label: 'Low', color: 'text-green-600' },
      medium: { variant: 'secondary' as const, label: 'Medium', color: 'text-orange-600' },
      high: { variant: 'default' as const, label: 'High', color: 'text-red-600' },
      critical: { variant: 'destructive' as const, label: 'Critical', color: 'text-red-800' }
    }
    return config[threat as keyof typeof config] || { variant: 'secondary' as const, label: threat, color: 'text-gray-600' }
  }

  const getPriceCompetitivenessColor = (pricing: string) => {
    if (pricing === 'lower') return 'text-red-600'
    if (pricing === 'similar') return 'text-green-600'
    return 'text-orange-600'
  }

  const columns = [
    {
      key: 'company_name',
      title: 'Company',
      render: (competitor: Competitor) => (
        <div>
          <Link 
            href={`/sales/competitors/${competitor.id}`}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            {competitor.company_name}
          </Link>
          <div className="text-sm text-muted-foreground">{competitor.brand_name}</div>
        </div>
      )
    },
    {
      key: 'company_type',
      title: 'Type',
      render: (competitor: Competitor) => {
        const { variant, label, icon: Icon } = getTypeBadge(competitor.company_type)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'market_position',
      title: 'Position',
      render: (competitor: Competitor) => {
        const { variant, label, icon: Icon } = getPositionBadge(competitor.market_position)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'market_share_percentage',
      title: 'Market Share',
      render: (competitor: Competitor) => (
        <div className="text-center">
          <div className="font-bold text-lg">{competitor.market_share_percentage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${(competitor.market_share_percentage / 30) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'estimated_revenue',
      title: 'Revenue',
      render: (competitor: Competitor) => (
        <span className="font-medium">
          {mounted ? `${(competitor.estimated_revenue / 1000000000000).toFixed(1)}T` : ''}
        </span>
      )
    },
    {
      key: 'price_competitiveness',
      title: 'Pricing',
      render: (competitor: Competitor) => (
        <span className={`font-medium capitalize ${getPriceCompetitivenessColor(competitor.price_competitiveness)}`}>
          {competitor.price_competitiveness}
        </span>
      )
    },
    {
      key: 'online_presence_score',
      title: 'Online Score',
      render: (competitor: Competitor) => (
        <div className="text-center">
          <div className="font-medium">{competitor.online_presence_score}/100</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${competitor.online_presence_score}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'threat_level',
      title: 'Threat Level',
      render: (competitor: Competitor) => {
        const { variant, label } = getThreatBadge(competitor.threat_level)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'last_analysis',
      title: 'Last Analysis',
      render: (competitor: Competitor) => (
        <span className="text-sm">{formatDate(competitor.last_analysis_date)}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (competitor: Competitor) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/competitors/${competitor.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/competitors/${competitor.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Competitor Analysis"
          description="Monitor competitors and track market intelligence"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm" asChild>
                <Link href="/sales/competitors/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competitor
                </Link>
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Competitors</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalCompetitors}</p>
                <p className="text-sm text-blue-600 mt-1">Being tracked</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Threats</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{summaryStats.criticalThreats}</p>
                <p className="text-sm text-red-600 mt-1">High priority</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Market Leaders</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.marketLeaders}</p>
                <p className="text-sm text-orange-600 mt-1">Top position</p>
              </div>
              <Crown className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Monitoring</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.activeMonitoring}</p>
                <p className="text-sm text-green-600 mt-1">Under watch</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Market Share</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${summaryStats.totalMarketShare.toFixed(1)}%` : ''}
                </p>
                <p className="text-sm text-purple-600 mt-1">Combined</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${(summaryStats.averageRevenue / 1000000000000).toFixed(1)}T` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">IDR per company</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online Score</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${summaryStats.averageOnlineScore.toFixed(0)}` : ''}
                </p>
                <p className="text-sm text-gray-600 mt-1">Average digital</p>
              </div>
              <Globe className="h-8 w-8 text-gray-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search competitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Company Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="online_only">Online Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Market Position</Label>
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All positions</SelectItem>
                    <SelectItem value="leader">Leader</SelectItem>
                    <SelectItem value="challenger">Challenger</SelectItem>
                    <SelectItem value="follower">Follower</SelectItem>
                    <SelectItem value="niche">Niche</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threat">Threat Level</Label>
                <Select value={threatFilter} onValueChange={setThreatFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All threat levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All threat levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeView === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('cards')}
            >
              Cards
            </Button>
            <Button
              variant={activeView === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('table')}
            >
              Table
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {sortedCompetitors.length} of {mockCompetitors.length} competitors
          </div>
        </div>

        {/* Content */}
        {activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCompetitors.map((competitor) => {
              const { variant: typeVariant, label: typeLabel, icon: TypeIcon } = getTypeBadge(competitor.company_type)
              const { variant: positionVariant, label: positionLabel, icon: PositionIcon } = getPositionBadge(competitor.market_position)
              const { variant: threatVariant, label: threatLabel } = getThreatBadge(competitor.threat_level)
              
              return (
                <Card key={competitor.id} className="p-6 hover: transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <div>
                        <Link 
                          href={`/sales/competitors/${competitor.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {competitor.company_name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {competitor.brand_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant={threatVariant}>{threatLabel}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <div className="flex items-center space-x-1">
                        <TypeIcon className="h-4 w-4" />
                        <Badge variant={typeVariant}>{typeLabel}</Badge>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Position:</span>
                      <div className="flex items-center space-x-1">
                        <PositionIcon className="h-4 w-4" />
                        <Badge variant={positionVariant}>{positionLabel}</Badge>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Founded:</span>
                      <span className="text-sm">{competitor.founded_year}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Headquarters:</span>
                      <span className="text-sm">{competitor.headquarters}</span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="text-center py-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{competitor.market_share_percentage}%</div>
                        <div className="text-sm text-muted-foreground mt-1">Market Share</div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Revenue:</span>
                        <span className="text-sm font-medium">
                          {mounted ? `${(competitor.estimated_revenue / 1000000000000).toFixed(1)}T` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Employees:</span>
                        <span className="text-sm font-medium">
                          {mounted ? `${(competitor.employee_count / 1000).toFixed(0)}K` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Stores:</span>
                        <span className="text-sm font-medium">{competitor.store_count}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Online Score:</span>
                        <span className="text-sm font-medium">{competitor.online_presence_score}/100</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Similarity:</span>
                        <span className="text-sm font-medium">{competitor.product_similarity_score}%</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Pricing:</span>
                        <span className={`text-sm font-medium capitalize ${getPriceCompetitivenessColor(competitor.price_competitiveness)}`}>
                          {competitor.price_competitiveness}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3 text-sm text-muted-foreground">
                      <div><strong>Strengths:</strong> {competitor.strengths.slice(0, 2).join(', ')}</div>
                      <div className="mt-1"><strong>Weaknesses:</strong> {competitor.weaknesses.slice(0, 2).join(', ')}</div>
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/sales/competitors/${competitor.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Analyze
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/sales/competitors/${competitor.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Competitor Analysis</h3>
              <p className="text-sm text-muted-foreground">Monitor all competitors and track market intelligence</p>
            </div>
            <AdvancedDataTable
              data={sortedCompetitors}
              columns={columns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 15,
                currentPage: 1,
                totalPages: Math.ceil(sortedCompetitors.length / 15),
                totalItems: sortedCompetitors.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {/* Critical Threats Alert */}
        {summaryStats.criticalThreats > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Critical Threat Alert</h3>
                <p className="text-red-700 mt-1">
                  {summaryStats.criticalThreats} competitors pose critical threats to our market position and require immediate strategic response.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Strategic Response
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}