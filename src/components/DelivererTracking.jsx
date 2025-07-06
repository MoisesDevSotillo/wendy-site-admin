import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Navigation,
  Clock,
  User,
  Phone,
  Truck,
  RefreshCw,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const DelivererTracking = () => {
  const [deliverers, setDeliverers] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedDeliverer, setSelectedDeliverer] = useState(null)

  const API_BASE_URL = 'https://wendy-backend1.onrender.com'

  const fetchDeliverersLocation = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/geolocation/admin/all-deliverers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDeliverers(data.deliverers || [])
        setStatistics(data.statistics || {})
        setLastUpdate(new Date(data.last_update))
      } else {
        console.error('Erro ao buscar localização dos entregadores:', await response.text())
      }
    } catch (error) {
      console.error('Erro de conexão:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeliverersLocation()
  }, [])

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDeliverersLocation()
      }, 30000) // Atualizar a cada 30 segundos
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'busy':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />
      case 'busy':
        return <Activity className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const openMapsLocation = (latitude, longitude, name) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&t=m`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-[#66CCFF]" />
          <span className="text-gray-600">Carregando localização dos entregadores...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Aprovados</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.total_approved || 0}</p>
              </div>
              <User className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online</p>
                <p className="text-2xl font-bold text-green-600">{statistics.online || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.available || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Entrega</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.busy || 0}</p>
              </div>
              <Truck className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            onClick={fetchDeliverersLocation}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600">
              Atualização automática (30s)
            </label>
          </div>
        </div>

        {lastUpdate && (
          <div className="text-sm text-gray-500">
            Última atualização: {formatTime(lastUpdate)}
          </div>
        )}
      </div>

      {/* Lista de entregadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {deliverers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Nenhum entregador com localização recente
              </h3>
              <p className="text-gray-600">
                Os entregadores precisam estar online e com o app aberto para aparecer aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          deliverers.map((deliverer) => (
            <Card key={deliverer.deliverer_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#66CCFF] p-2 rounded-full">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{deliverer.name}</CardTitle>
                      <p className="text-sm text-gray-600">{deliverer.vehicle_type}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(deliverer.status)} flex items-center space-x-1`}>
                    {getStatusIcon(deliverer.status)}
                    <span className="capitalize">{deliverer.status === 'available' ? 'Disponível' : 'Em Entrega'}</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Informações de contato */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{deliverer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {formatTime(deliverer.location.last_update)}
                    </span>
                  </div>
                </div>

                {/* Localização */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-[#66CCFF]" />
                      <span className="text-sm font-medium">Localização Atual</span>
                    </div>
                    <Button
                      onClick={() => openMapsLocation(
                        deliverer.location.latitude,
                        deliverer.location.longitude,
                        deliverer.name
                      )}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Ver no Mapa
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Lat:</span> {deliverer.location.latitude.toFixed(6)}
                    </div>
                    <div>
                      <span className="font-medium">Lng:</span> {deliverer.location.longitude.toFixed(6)}
                    </div>
                    {deliverer.location.speed && (
                      <div>
                        <span className="font-medium">Velocidade:</span> {deliverer.location.speed.toFixed(1)} km/h
                      </div>
                    )}
                    {deliverer.location.accuracy && (
                      <div>
                        <span className="font-medium">Precisão:</span> {deliverer.location.accuracy.toFixed(0)}m
                      </div>
                    )}
                  </div>
                </div>

                {/* Pedido atual (se houver) */}
                {deliverer.current_order && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Pedido em Andamento
                      </span>
                    </div>
                    <div className="text-xs text-yellow-700 space-y-1">
                      <div><span className="font-medium">ID:</span> #{deliverer.current_order.order_id}</div>
                      <div><span className="font-medium">Loja:</span> {deliverer.current_order.store_name}</div>
                      <div><span className="font-medium">Cliente:</span> {deliverer.current_order.client_name}</div>
                      <div><span className="font-medium">Endereço:</span> {deliverer.current_order.delivery_address}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default DelivererTracking

