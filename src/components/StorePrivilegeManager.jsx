import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Store,
  Crown,
  Star,
  Package,
  TrendingUp,
  Users,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

const StorePrivilegeManager = () => {
  const [stores, setStores] = useState([])
  const [privilegedStores, setPrivilegedStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'privileged', 'non_privileged'
  const [selectedStores, setSelectedStores] = useState([])
  const [batchAction, setBatchAction] = useState('')

  const API_BASE_URL = 'https://main.d3qsbefcpv5hbl.amplifyapp.com/api'

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Buscar candidatos a privilégio
      const candidatesResponse = await fetch(`${API_BASE_URL}/admin/stores/privilege-candidates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json()
        setStores(candidatesData.candidate_stores || [])
      }

      // Buscar lojas privilegiadas
      const privilegedResponse = await fetch(`${API_BASE_URL}/admin/stores/privileged`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (privilegedResponse.ok) {
        const privilegedData = await privilegedResponse.json()
        setPrivilegedStores(privilegedData.privileged_stores || [])
      }

    } catch (error) {
      console.error('Erro ao buscar lojas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [])

  const toggleStorePrivilege = async (storeId, currentStatus, storeName) => {
    const newStatus = !currentStatus
    const action = newStatus ? 'conceder' : 'remover'
    const reason = prompt(`Motivo para ${action} privilégio para ${storeName}:`)
    
    if (reason === null) return // Usuário cancelou

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/admin/stores/${storeId}/privilege`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_privileged: newStatus,
          reason: reason
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchStores() // Recarregar dados
      } else {
        const errorData = await response.json()
        alert(`Erro: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro ao alterar privilégio:', error)
      alert('Erro ao alterar privilégio da loja')
    }
  }

  const handleBatchAction = async () => {
    if (selectedStores.length === 0) {
      alert('Selecione pelo menos uma loja')
      return
    }

    if (!batchAction) {
      alert('Selecione uma ação')
      return
    }

    const actionText = batchAction === 'grant' ? 'conceder privilégio' : 'remover privilégio'
    const reason = prompt(`Motivo para ${actionText} para ${selectedStores.length} loja(s):`)
    
    if (reason === null) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/admin/stores/privilege/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          store_ids: selectedStores,
          action: batchAction,
          reason: reason
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Ação executada: ${data.total_processed} lojas processadas, ${data.total_errors} erros`)
        setSelectedStores([])
        setBatchAction('')
        fetchStores()
      } else {
        const errorData = await response.json()
        alert(`Erro: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro na ação em lote:', error)
      alert('Erro ao executar ação em lote')
    }
  }

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'privileged' && store.is_privileged) ||
                         (filterType === 'non_privileged' && !store.is_privileged)
    
    return matchesSearch && matchesFilter
  })

  const handleSelectStore = (storeId) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStores.length === filteredStores.length) {
      setSelectedStores([])
    } else {
      setSelectedStores(filteredStores.map(store => store.id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-[#66CCFF]" />
          <span className="text-gray-600">Carregando lojas...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Lojas</p>
                <p className="text-2xl font-bold text-gray-800">{stores.length}</p>
              </div>
              <Store className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Privilegiadas</p>
                <p className="text-2xl font-bold text-yellow-600">{privilegedStores.length}</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Não Privilegiadas</p>
                <p className="text-2xl font-bold text-blue-600">{stores.length - privilegedStores.length}</p>
              </div>
              <Store className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selecionadas</p>
                <p className="text-2xl font-bold text-green-600">{selectedStores.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros e Ações</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca e Filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome da loja ou proprietário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66CCFF] focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66CCFF] focus:border-transparent"
            >
              <option value="all">Todas as lojas</option>
              <option value="privileged">Apenas privilegiadas</option>
              <option value="non_privileged">Apenas não privilegiadas</option>
            </select>

            <Button
              onClick={fetchStores}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar</span>
            </Button>
          </div>

          {/* Ações em Lote */}
          {selectedStores.length > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-800">
                {selectedStores.length} loja(s) selecionada(s)
              </span>
              
              <select
                value={batchAction}
                onChange={(e) => setBatchAction(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecionar ação</option>
                <option value="grant">Conceder privilégio</option>
                <option value="revoke">Remover privilégio</option>
              </select>

              <Button
                onClick={handleBatchAction}
                disabled={!batchAction}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Executar
              </Button>

              <Button
                onClick={() => setSelectedStores([])}
                variant="outline"
                size="sm"
              >
                Limpar seleção
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Lojas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Privilégios das Lojas</CardTitle>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedStores.length === filteredStores.length && filteredStores.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              <label className="text-sm text-gray-600">Selecionar todas</label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStores.length === 0 ? (
              <div className="text-center py-8">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Nenhuma loja encontrada
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros ou termos de busca.
                </p>
              </div>
            ) : (
              filteredStores.map((store) => (
                <div key={store.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store.id)}
                        onChange={() => handleSelectStore(store.id)}
                        className="rounded"
                      />
                      
                      <div className="flex items-center space-x-3">
                        <div className="bg-[#66CCFF] p-2 rounded-full">
                          <Store className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-800">{store.name}</h3>
                            {store.is_privileged && (
                              <Badge className="bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                                <Crown className="h-3 w-3" />
                                <span>Privilegiada</span>
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">Proprietário: {store.user_name}</p>
                          <p className="text-sm text-gray-600">Categoria: {store.category}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Estatísticas da loja */}
                      <div className="text-right text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4" />
                          <span>{store.products_count} produtos</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{store.success_rate?.toFixed(1)}% sucesso</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{store.total_orders} pedidos</span>
                        </div>
                      </div>

                      {/* Switch de privilégio */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">
                          {store.is_privileged ? 'Privilegiada' : 'Normal'}
                        </span>
                        <Switch
                          checked={store.is_privileged}
                          onCheckedChange={() => toggleStorePrivilege(store.id, store.is_privileged, store.name)}
                          className="data-[state=checked]:bg-yellow-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StorePrivilegeManager

