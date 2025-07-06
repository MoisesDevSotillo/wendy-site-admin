import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Store,
  Truck,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Settings,
  LogOut,
  MapPin,
  Crown
} from 'lucide-react'
import DelivererTracking from './components/DelivererTracking'
import StorePrivilegeManager from './components/StorePrivilegeManager'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const [adminData, setAdminData] = useState({
    totalStores: 0,
    activeStores: 0,
    pendingStores: 0,
    totalDeliverers: 0,
    activeDeliverers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    monthlyOrders: 0
  })
  const [pendingStores, setPendingStores] = useState([])
  const [pendingDeliverers, setPendingDeliverers] = useState([])
  const [allStores, setAllStores] = useState([])
  const [allDeliverers, setAllDeliverers] = useState([])
  const [allowedCities, setAllowedCities] = useState([])
  const [categories, setCategories] = useState([])
  const [showAddCityModal, setShowAddCityModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCity, setNewCity] = useState({
    name: '',
    state: '',
    delivery_fee_per_km: 2.0,
    minimum_order_value: 30.0
  })
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#66CCFF',
    sort_order: 0
  })

  const API_BASE_URL = 'https://wendy-backend1.onrender.com/api'

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Buscar estatísticas do dashboard
        const dashboardResponse = await fetch(`${API_BASE_URL}/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          setAdminData({
            totalStores: dashboardData.stores?.total || 0,
            activeStores: dashboardData.stores?.active || 0,
            pendingStores: dashboardData.stores?.pending || 0,
            totalDeliverers: dashboardData.deliverers?.total || 0,
            activeDeliverers: dashboardData.deliverers?.active || 0,
            totalRevenue: dashboardData.revenue?.total || 0,
            monthlyRevenue: dashboardData.revenue?.monthly || 0,
            totalOrders: dashboardData.orders?.total || 0,
            monthlyOrders: dashboardData.orders?.monthly || 0
          })
        }

        // Buscar lojistas pendentes
        const pendingStoresResponse = await fetch(`${API_BASE_URL}/admin/stores/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (pendingStoresResponse.ok) {
          const pendingStoresData = await pendingStoresResponse.json()
          setPendingStores(pendingStoresData.stores || [])
        }

        // Buscar entregadores pendentes
        const pendingDeliverersResponse = await fetch(`${API_BASE_URL}/admin/deliverers/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (pendingDeliverersResponse.ok) {
          const pendingDeliverersData = await pendingDeliverersResponse.json()
          setPendingDeliverers(pendingDeliverersData.deliverers || [])
        }

        // Buscar todas as lojas
        const allStoresResponse = await fetch(`${API_BASE_URL}/admin/stores`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (allStoresResponse.ok) {
          const allStoresData = await allStoresResponse.json()
          setAllStores(allStoresData.stores || [])
        }

        // Buscar todos os entregadores
        const allDeliverersResponse = await fetch(`${API_BASE_URL}/admin/deliverers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (allDeliverersResponse.ok) {
          const allDeliverersData = await allDeliverersResponse.json()
          setAllDeliverers(allDeliverersData.deliverers || [])
        }

        // Buscar cidades permitidas
        const citiesResponse = await fetch(`${API_BASE_URL}/admin/cities`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (citiesResponse.ok) {
          const citiesData = await citiesResponse.json()
          setAllowedCities(citiesData.cities || [])
        }

        // Buscar categorias
        const categoriesResponse = await fetch(`${API_BASE_URL}/admin/categories/admin`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories || [])
        }

      } catch (error) {
        console.error('Erro ao buscar dados do admin:', error)
      }
    }

    if (isLoggedIn) {
      fetchAdminData()
    }
  }, [isLoggedIn])

  const handleLogin = () => {
    // Simular login de admin - em produção, implementar autenticação real
    localStorage.setItem('token', 'admin-token-simulado')
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
  }

  const approveStore = async (storeId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/admin/stores/${storeId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Loja aprovada com sucesso!')
        // Atualizar listas
        setPendingStores(prev => prev.filter(store => store.id !== storeId))
        setAdminData(prev => ({
          ...prev,
          activeStores: prev.activeStores + 1,
          pendingStores: prev.pendingStores - 1
        }))
      } else {
        const errorData = await response.json()
        alert(`Erro ao aprovar loja: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro ao aprovar loja:', error)
      alert('Erro ao aprovar loja')
    }
  }

  const rejectStore = async (storeId) => {
    const reason = prompt('Motivo da rejeição:')
    if (!reason) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/admin/stores/${storeId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        alert('Loja rejeitada com sucesso!')
        // Atualizar listas
        setPendingStores(prev => prev.filter(store => store.id !== storeId))
        setAdminData(prev => ({
          ...prev,
          pendingStores: prev.pendingStores - 1
        }))
      } else {
        const errorData = await response.json()
        alert(`Erro ao rejeitar loja: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro ao rejeitar loja:', error)
      alert('Erro ao rejeitar loja')
    }
  }

  const approveDeliverer = async (delivererId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/admin/deliverers/${delivererId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Entregador aprovado com sucesso!')
        // Atualizar listas
        setPendingDeliverers(prev => prev.filter(deliverer => deliverer.id !== delivererId))
        setAdminData(prev => ({
          ...prev,
          activeDeliverers: prev.activeDeliverers + 1
        }))
      } else {
        const errorData = await response.json()
        alert(`Erro ao aprovar entregador: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro ao aprovar entregador:', error)
      alert('Erro ao aprovar entregador')
    }
  }

  const rejectDeliverer = async (delivererId) => {
    const reason = prompt('Motivo da rejeição:')
    if (!reason) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/admin/deliverers/${delivererId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        alert('Entregador rejeitado com sucesso!')
        // Atualizar listas
        setPendingDeliverers(prev => prev.filter(deliverer => deliverer.id !== delivererId))
      } else {
        const errorData = await response.json()
        alert(`Erro ao rejeitar entregador: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro ao rejeitar entregador:', error)
      alert('Erro ao rejeitar entregador')
    }
  }

  const deleteUser = async (userId, userType, userName) => {
    const reason = prompt(`Motivo para excluir ${userName}:`)
    if (!reason) return

    if (!confirm(`Tem certeza que deseja excluir ${userName}? Esta ação não pode ser desfeita.`)) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        alert(`${userName} excluído com sucesso!`)
        // Atualizar listas baseado no tipo
        if (userType === 'store') {
          setAllStores(prev => prev.filter(store => store.user_id !== userId))
          setAdminData(prev => ({
            ...prev,
            totalStores: prev.totalStores - 1,
            activeStores: prev.activeStores - 1
          }))
        } else if (userType === 'deliverer') {
          setAllDeliverers(prev => prev.filter(deliverer => deliverer.user_id !== userId))
          setAdminData(prev => ({
            ...prev,
            totalDeliverers: prev.totalDeliverers - 1,
            activeDeliverers: prev.activeDeliverers - 1
          }))
        }
      } else {
        const errorData = await response.json()
        alert(`Erro ao excluir usuário: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#66CCFF] to-[#4DB8FF] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-[#66CCFF] p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Wendy Admin</CardTitle>
            <p className="text-gray-600">Painel de Administração</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleLogin}
              className="w-full bg-[#66CCFF] hover:bg-[#4DB8FF] text-white"
            >
              Entrar como Administrador
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-[#66CCFF] p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Wendy Admin</h2>
              <p className="text-sm text-gray-600">Administrador</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'stores', label: 'Lojistas', icon: Store },
            { id: 'deliverers', label: 'Entregadores', icon: Truck },
            { id: 'tracking', label: 'Rastreamento', icon: MapPin },
            { id: 'privileges', label: 'Privilégios', icon: Crown },
            { id: 'cities', label: 'Cidades', icon: Users },
            { id: 'categories', label: 'Categorias', icon: Settings },
            { id: 'settings', label: 'Configurações', icon: Settings }
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id ? 'bg-[#66CCFF]/10 border-r-2 border-[#66CCFF] text-[#66CCFF]' : 'text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="flex justify-between">
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'stores' && 'Gestão de Lojistas'}
                {activeTab === 'deliverers' && 'Gestão de Entregadores'}
                {activeTab === 'tracking' && 'Rastreamento de Entregadores'}
                {activeTab === 'privileges' && 'Gestão de Privilégios'}
                {activeTab === 'cities' && 'Gestão de Cidades'}
                {activeTab === 'categories' && 'Gestão de Categorias'}
                {activeTab === 'settings' && 'Configurações'}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'dashboard' && 'Visão geral da plataforma Wendy'}
                {activeTab === 'stores' && 'Gerencie lojistas e aprovações'}
                {activeTab === 'deliverers' && 'Gerencie entregadores cadastrados'}
                {activeTab === 'tracking' && 'Visualize a localização dos entregadores em tempo real'}
                {activeTab === 'privileges' && 'Gerencie privilégios das lojas na busca de produtos'}
                {activeTab === 'cities' && 'Gerencie cidades onde a plataforma opera'}
                {activeTab === 'categories' && 'Gerencie categorias e subcategorias de produtos'}
                {activeTab === 'settings' && 'Configurações da plataforma'}
              </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lojistas Ativos</p>
                        <p className="text-2xl font-bold text-gray-800">{adminData.activeStores}</p>
                        <p className="text-sm text-gray-600">de {adminData.totalStores} total</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Store className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Entregadores Ativos</p>
                        <p className="text-2xl font-bold text-gray-800">{adminData.activeDeliverers}</p>
                        <p className="text-sm text-gray-600">de {adminData.totalDeliverers} total</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <Truck className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Receita Total</p>
                        <p className="text-2xl font-bold text-gray-800">R$ {adminData.totalRevenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Este mês: R$ {adminData.monthlyRevenue.toFixed(2)}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pedidos Total</p>
                        <p className="text-2xl font-bold text-gray-800">{adminData.totalOrders}</p>
                        <p className="text-sm text-gray-600">Este mês: {adminData.monthlyOrders}</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-full">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Approvals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lojistas Pendentes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lojistas Pendentes de Aprovação ({pendingStores.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {pendingStores.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nenhum lojista pendente</p>
                      ) : (
                        pendingStores.map((store) => (
                          <div key={store.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h3 className="font-semibold text-gray-800">{store.name}</h3>
                              <p className="text-sm text-gray-600">Proprietário: {store.owner_name}</p>
                              <p className="text-sm text-gray-600">Email: {store.owner_email}</p>
                              <p className="text-sm text-gray-600">Categoria: {store.category}</p>
                              <p className="text-sm text-gray-600">CNPJ: {store.cnpj}</p>
                              <p className="text-sm text-gray-600">Cidade: {store.city}</p>
                              <p className="text-sm text-gray-600">Data: {new Date(store.created_at).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button
                                onClick={() => approveStore(store.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                onClick={() => rejectStore(store.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Entregadores Pendentes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Entregadores Pendentes de Aprovação ({pendingDeliverers.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {pendingDeliverers.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nenhum entregador pendente</p>
                      ) : (
                        pendingDeliverers.map((deliverer) => (
                          <div key={deliverer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h3 className="font-semibold text-gray-800">{deliverer.user_name}</h3>
                              <p className="text-sm text-gray-600">Telefone: {deliverer.user_phone}</p>
                              <p className="text-sm text-gray-600">CPF: {deliverer.cpf}</p>
                              <p className="text-sm text-gray-600">Veículo: {deliverer.vehicle_type}</p>
                              <p className="text-sm text-gray-600">Placa: {deliverer.vehicle_plate}</p>
                              <p className="text-sm text-gray-600">Data: {new Date(deliverer.created_at).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button
                                onClick={() => approveDeliverer(deliverer.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                onClick={() => rejectDeliverer(deliverer.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Tracking */}
          {activeTab === 'tracking' && (
            <DelivererTracking />
          )}

          {/* Store Privileges */}
          {activeTab === 'privileges' && (
            <StorePrivilegeManager />
          )}

          {/* Stores Management */}
          {activeTab === 'stores' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{adminData.totalStores}</p>
                  <p className="text-gray-600">Total de Lojistas</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{adminData.activeStores}</p>
                  <p className="text-gray-600">Lojistas Ativos</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{adminData.pendingStores}</p>
                  <p className="text-gray-600">Pendentes de Aprovação</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Todos os Lojistas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {allStores.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Nenhum lojista cadastrado</p>
                    ) : (
                      allStores.map((store) => (
                        <div key={store.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-semibold text-gray-800">{store.name}</h3>
                            <p className="text-sm text-gray-600">Proprietário: {store.owner_name}</p>
                            <p className="text-sm text-gray-600">Email: {store.owner_email}</p>
                            <p className="text-sm text-gray-600">Categoria: {store.category}</p>
                            <p className="text-sm text-gray-600">Cidade: {store.city}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant={store.is_approved ? "default" : store.approval_status === 'pending' ? "secondary" : "destructive"}>
                                {store.approval_status === 'approved' ? 'Aprovado' : 
                                 store.approval_status === 'pending' ? 'Pendente' : 'Rejeitado'}
                              </Badge>
                              <Badge variant={store.is_active ? "default" : "destructive"}>
                                {store.is_active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            {!store.is_approved && store.approval_status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => approveStore(store.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  onClick={() => rejectStore(store.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            <Button
                              onClick={() => deleteUser(store.user_id, 'store', store.name)}
                              variant="destructive"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Deliverers Management */}
          {activeTab === 'deliverers' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{adminData.totalDeliverers}</p>
                  <p className="text-gray-600">Total de Entregadores</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{adminData.activeDeliverers}</p>
                  <p className="text-gray-600">Entregadores Ativos</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Todos os Entregadores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {allDeliverers.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Nenhum entregador cadastrado</p>
                    ) : (
                      allDeliverers.map((deliverer) => (
                        <div key={deliverer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-semibold text-gray-800">{deliverer.user_name}</h3>
                            <p className="text-sm text-gray-600">Telefone: {deliverer.user_phone}</p>
                            <p className="text-sm text-gray-600">CPF: {deliverer.cpf}</p>
                            <p className="text-sm text-gray-600">Veículo: {deliverer.vehicle_type}</p>
                            <p className="text-sm text-gray-600">Placa: {deliverer.vehicle_plate}</p>
                            <p className="text-sm text-gray-600">Avaliação: {deliverer.rating}/5.0</p>
                            <p className="text-sm text-gray-600">Entregas: {deliverer.total_deliveries}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant={deliverer.is_approved ? "default" : deliverer.approval_status === 'pending' ? "secondary" : "destructive"}>
                                {deliverer.approval_status === 'approved' ? 'Aprovado' : 
                                 deliverer.approval_status === 'pending' ? 'Pendente' : 'Rejeitado'}
                              </Badge>
                              <Badge variant={deliverer.is_online ? "default" : "secondary"}>
                                {deliverer.is_online ? 'Online' : 'Offline'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            {!deliverer.is_approved && deliverer.approval_status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => approveDeliverer(deliverer.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  onClick={() => rejectDeliverer(deliverer.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            <Button
                              onClick={() => deleteUser(deliverer.user_id, 'deliverer', deliverer.user_name)}
                              variant="destructive"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Configurações Gerais</h3>
                    <p className="text-gray-600">Taxa da plataforma: 5%</p>
                    <p className="text-gray-600">Taxa de entrega padrão: R$ 5,00</p>
                    <p className="text-gray-600">Pedido mínimo: R$ 30,00</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Integrações</h3>
                    <p className="text-gray-600">Mercado Pago: Configurado</p>
                    <p className="text-gray-600">Notificações: Ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default App


