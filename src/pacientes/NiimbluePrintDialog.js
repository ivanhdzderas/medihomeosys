import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
  Chip,
  Paper
} from '@mui/material';
import { Print, Bluetooth, BluetoothConnected } from '@mui/icons-material';
import { NiimbotBluetoothClient, ImageEncoder } from '@mmote/niimbluelib';

const NiimbluePrintDialog = ({ open, onClose, printData, onPrintSuccess, onPrintError }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [bluetoothClient, setBluetoothClient] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [printProgress, setPrintProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('Desconectado');
  const [currentAction, setCurrentAction] = useState('');
  const [debugLogs, setDebugLogs] = useState([]);

  // Función para manejar errores GATT específicos
  const handleGattError = (error) => {
    if (!error) return 'Error desconocido';
    const msg = error.message || String(error);
    if (msg.includes('GATT') || 
        msg.includes('already in progress') ||
        msg.includes('operation already')) {
      return 'Error de comunicación Bluetooth: La operación ya está en progreso. ' +
             'Espere a que termine la operación actual y reintente. ' +
             'Si persiste, desconecte y vuelva a conectar la impresora.';
    }
    return msg;
  };

  // Función para agregar logs de debug
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    setDebugLogs(prev => [...prev, logEntry].slice(-50));
    console.log(`[${timestamp}] ${message}`);
  };

  // Conectar impresora
  const connectPrinter = async () => {
    if (isConnecting) {
      const errorMsg = 'Ya hay una operación de conexión en progreso';
      setConnectionError(errorMsg);
      addDebugLog(errorMsg, 'error');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    setCurrentStatus('Conectando...');
    setCurrentAction('Buscando dispositivos Bluetooth');
    addDebugLog('Iniciando conexión Bluetooth', 'info');
    
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth no está soportado en este navegador. Usa Chrome o Edge en Android/Windows.');
      }

      // Limpiar cliente anterior si existe
      if (bluetoothClient) {
        try {
          addDebugLog('Desconectando cliente anterior', 'info');
          await bluetoothClient.disconnect();
        } catch (disconnectError) {
          addDebugLog(`Advertencia al desconectar: ${disconnectError.message}`, 'warning');
        }
      }

      setCurrentAction('Creando cliente Bluetooth');
      addDebugLog('Creando nuevo cliente NiimbotBluetoothClient', 'info');
      const client = new NiimbotBluetoothClient();

      client.on("connect", () => {
        addDebugLog('✅ Conectado exitosamente a la impresora', 'success');
        setIsConnected(true);
        setCurrentStatus('Conectado');
        setCurrentAction('Conexión establecida');
      });

      client.on("disconnect", () => {
        addDebugLog('❌ Desconectado de la impresora', 'error');
        setIsConnected(false);
        setCurrentStatus('Desconectado');
        setCurrentAction('Conexión perdida');
      });

      client.on("printprogress", (e) => {
        setPrintProgress(e.pagePrintProgress);
        setCurrentAction(`Imprimiendo: ${e.pagePrintProgress}% completado`);
      });

      setCurrentAction('Solicitando conexión a impresora');
      addDebugLog('Iniciando conexión Bluetooth', 'info');
      
      const connectTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: La conexión está tomando demasiado tiempo')), 30000)
      );

      await Promise.race([client.connect(), connectTimeoutPromise]);
      
      setBluetoothClient(client);
      setCurrentAction('Verificando comunicación con impresora');
      addDebugLog('Conexión exitosa, verificando dispositivo', 'info');

      try {
        const deviceInfo = await client.abstraction.getDeviceInfo();
        addDebugLog(`Información del dispositivo: ${JSON.stringify(deviceInfo)}`, 'info');
        setCurrentAction('Comunicación verificada ✓');
      } catch (testError) {
        addDebugLog('Advertencia: Test de comunicación falló, pero conectado', 'warning');
        setCurrentAction('Conexión establecida (verificación limitada)');
      }
      
    } catch (error) {
      const errorMsg = handleGattError(error);
      addDebugLog(`❌ Error en conexión: ${errorMsg}`, 'error');
      setConnectionError(errorMsg);
      setIsConnected(false);
      setCurrentStatus('Error de conexión');
      setCurrentAction('Conexión fallida');
    } finally {
      setIsConnecting(false);
    }
  };

  // Función para ajustar el ancho a múltiplo de 8
  const adjustWidthToMultipleOf8 = (width) => {
    return Math.floor(width / 8) * 8;
  };

  // Función para rotar canvas 90 grados a la izquierda
  const rotateCanvas90Left = (canvas) => {
    const rotatedCanvas = document.createElement('canvas');
    // Ajustar dimensiones para que sean múltiplos de 8
    const adjustedWidth = adjustWidthToMultipleOf8(canvas.height);
    const adjustedHeight = adjustWidthToMultipleOf8(canvas.width);
    
    rotatedCanvas.width = adjustedWidth;
    rotatedCanvas.height = adjustedHeight;
    
    const ctx = rotatedCanvas.getContext('2d');
    
    // Rotar 90 grados a la izquierda
    ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    
    return rotatedCanvas;
  };

// La nueva función de creación de canvas con el medicamento en letra grande
const createRotatedLabelImage = (medicamentoData) => {
  if (!printData || !printData.consulta) {
    throw new Error('Datos de impresión no disponibles');
  }

  // Dimensiones del canvas para el formato deseado (vertical)
  const baseWidth = 384; 
  const baseHeight = 224; 

  const originalCanvas = document.createElement('canvas');
  originalCanvas.width = baseWidth;
  originalCanvas.height = baseHeight;
  const ctx = originalCanvas.getContext('2d');

  // Fondo blanco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, originalCanvas.width, originalCanvas.height);

  // Título principal con fondo azul oscuro
  ctx.fillStyle = '#0b5ed7'; 
  ctx.fillRect(0, 0, originalCanvas.width, 40); 
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial'; 
  ctx.textAlign = 'center';
  ctx.fillText('MEDICAMENTO HOMEOPATICO', originalCanvas.width / 2, 30);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#000000';

  // Información del paciente
  const FONT_SIZE_SMALL = 14;
  const LINE_HEIGHT_SMALL = FONT_SIZE_SMALL + 5;
  let currentY = 50;

  ctx.font = `bold ${FONT_SIZE_SMALL}px Arial`;
  ctx.fillText('PACIENTE:', 10, currentY);
  ctx.font = `normal ${FONT_SIZE_SMALL}px Arial`;
  ctx.fillText(printData.consulta.paciente_nombre || 'N/A', 110, currentY); 
  currentY += LINE_HEIGHT_SMALL;

  // Fecha
  ctx.font = `bold ${FONT_SIZE_SMALL}px Arial`;
  ctx.fillText('FECHA:', 10, currentY);
  ctx.font = `normal ${FONT_SIZE_SMALL}px Arial`;
  ctx.fillText(new Date(printData.consulta.fecha).toLocaleDateString() || 'N/A', 110, currentY);
  currentY += LINE_HEIGHT_SMALL;
  currentY += 10;

  // Dosis e indicaciones
  ctx.font = `bold ${FONT_SIZE_SMALL}px Arial`;
  ctx.fillText('TOMAR:', 10, currentY);
  ctx.font = `normal ${FONT_SIZE_SMALL}px Arial`;
  ctx.fillText(medicamentoData.dosis || 'N/A', 110, currentY);
  currentY += LINE_HEIGHT_SMALL;

  ctx.font = `bold ${FONT_SIZE_SMALL}px Arial`;
  ctx.fillText('CADA:', 10, currentY);
  ctx.font = `normal ${FONT_SIZE_SMALL}px Arial`;
  ctx.fillText(medicamentoData.duracion || 'N/A', 110, currentY);
  currentY += LINE_HEIGHT_SMALL;

  // Medicamento en letra GRANDE, ahora alineado a la izquierda
  const FONT_SIZE_MEDICAMENTO = 28;
  const LINE_HEIGHT_MEDICAMENTO = FONT_SIZE_MEDICAMENTO + 5;
  currentY += 10; // Espacio para separar
  
  ctx.font = `bold ${FONT_SIZE_MEDICAMENTO}px Arial`;
  ctx.textAlign = 'left'; // Alinear el texto del medicamento a la izquierda
  const medicamentoName = medicamentoData.medicamento || '';
  const maxWidth = originalCanvas.width - 20;

  // Manejar texto largo, ahora alineado a la izquierda
  const words = medicamentoName.split(' ');
  let line = '';
  const lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // Dibujar cada línea alineada a la izquierda
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 10, currentY + (i * LINE_HEIGHT_MEDICAMENTO));
  }
  
  // Rotar el canvas 90 grados a la izquierda para la impresión
  const rotatedCanvas = rotateCanvas90Left(originalCanvas);
  
  return rotatedCanvas;
};
  // Imprimir etiqueta con imagen rotada y ancho compatible
  const printLabel = async (medicamentoData) => {
    if (!bluetoothClient || !isConnected) {
      throw new Error('No conectado a la impresora');
    }

    if (isPrinting) {
      throw new Error('Ya hay una operación de impresión en progreso');
    }

    try {
      setCurrentAction('Creando imagen compatible con impresora');
      addDebugLog('Creando imagen con ancho múltiplo de 8', 'info');
      
      const rotatedCanvas = createRotatedLabelImage(medicamentoData);

      setCurrentAction('Configurando impresión B1');
      addDebugLog('Configurando impresión para modelo B1', 'info');
      
      try {
        const abstraction = bluetoothClient.abstraction || {};
        
        if (typeof abstraction.newPrintTask === 'function') {
          addDebugLog('Usando printTask para impresión con imagen compatible', 'info');
          const printTask = abstraction.newPrintTask("B1", {
            totalPages: 1,
            statusPollIntervalMs: 100,
            statusTimeoutMs: 10000,
            density: 3,
          });

          await printTask.printInit();

          addDebugLog('Codificando canvas con ImageEncoder (left)', 'info');
          const encodedImage = ImageEncoder.encodeCanvas(rotatedCanvas, "left");
          
          addDebugLog(`Enviando imagen ${rotatedCanvas.width}x${rotatedCanvas.height}px a impresora`, 'info');
          await printTask.printPage(encodedImage, 1);

          await printTask.waitForFinished();
          await printTask.printEnd();

        } else {
          throw new Error('Método newPrintTask no disponible');
        }

        setCurrentAction('Etiqueta enviada exitosamente');
        addDebugLog('✅ Etiqueta impresa correctamente', 'success');
        return true;

      } catch (printError) {
        const gattError = handleGattError(printError);
        addDebugLog(`❌ Error al imprimir: ${gattError}`, 'error');
        
        const msg = (printError && printError.message) ? printError.message : String(printError);
        if (msg.includes('column') || msg.includes('multiple') || msg.includes('8')) {
          addDebugLog('ERROR: Problema con dimensiones de imagen - verificar múltiplos de 8', 'error');
        }
        
        throw new Error(gattError);
      }

    } catch (error) {
      setCurrentAction(`Error: ${error.message}`);
      addDebugLog(`❌ Error en impresión: ${error.message}`, 'error');
      throw error;
    }
  };

  // Imprimir todas las etiquetas
  const handlePrintAll = async () => {
    if (isPrinting) {
      setConnectionError('Ya hay una impresión en progreso');
      return;
    }

    if (!isConnected || !bluetoothClient) {
      setConnectionError('No conectado a la impresora');
      return;
    }

    if (!printData || !printData.tratamientos || printData.tratamientos.length === 0) {
      setConnectionError('No hay datos para imprimir');
      return;
    }

    setIsPrinting(true);
    setConnectionError(null);
    setPrintProgress(0);
    setCurrentAction('Iniciando proceso de impresión');
    addDebugLog(`Iniciando impresión de ${printData.tratamientos.length} etiquetas`, 'info');

    try {
      let successCount = 0;
      const totalLabels = printData.tratamientos.length;

      for (const [index, medicamento] of printData.tratamientos.entries()) {
        try {
          setCurrentAction(`Imprimiendo etiqueta ${index + 1} de ${totalLabels}`);
          setPrintProgress(Math.round((index / totalLabels) * 100));
          addDebugLog(`Procesando etiqueta ${index + 1}/${totalLabels}`, 'info');
          
          // Pausa entre etiquetas para evitar GATT errors
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 800));
          }
          
          await printLabel(medicamento);
          successCount++;
          
          setPrintProgress(Math.round(((index + 1) / totalLabels) * 100));
          addDebugLog(`✅ Etiqueta ${index + 1} enviada exitosamente`, 'success');

        } catch (error) {
          const errorMsg = `Error en etiqueta ${index + 1}: ${error.message}`;
          setCurrentAction(errorMsg);
          addDebugLog(`❌ ${errorMsg}`, 'error');
          // Pausa más larga después de un error
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      if (successCount > 0) {
        const successMsg = `Impresión completada: ${successCount}/${totalLabels} etiquetas`;
        setCurrentAction(successMsg);
        addDebugLog(`🎉 ${successMsg}`, 'success');
        onPrintSuccess && onPrintSuccess();
        setPrintProgress(100);
      } else {
        throw new Error('No se pudo imprimir ninguna etiqueta');
      }

    } catch (error) {
      const errorMsg = handleGattError(error);
      setConnectionError(errorMsg);
      setCurrentAction(`Error general: ${errorMsg}`);
      addDebugLog(`❌ Error en proceso de impresión: ${errorMsg}`, 'error');
      onPrintError && onPrintError(error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleClose = () => {
    if (bluetoothClient && isConnected) {
      try {
        addDebugLog('Desconectando impresora', 'info');
        bluetoothClient.disconnect();
      } catch (error) {
        addDebugLog(`Error al desconectar: ${error.message}`, 'warning');
      }
    }
    
    setBluetoothClient(null);
    setIsConnected(false);
    setConnectionError(null);
    setPrintProgress(0);
    setCurrentStatus('Desconectado');
    setCurrentAction('');
    setDebugLogs([]);
    onClose();
  };

  const handleRetry = () => {
    setConnectionError(null);
    setDebugLogs([]);
    connectPrinter();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Print sx={{ mr: 1 }} />
            Imprimir Etiquetas de Medicamentos
          </Box>
          <Chip 
            label={currentStatus} 
            color={isConnected ? 'success' : isConnecting ? 'warning' : 'error'}
            size="small"
          />
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Panel de información principal */}
        {printData && printData.consulta ? (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Consulta: {new Date(printData.consulta.fecha).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Paciente: <strong>{printData.consulta.paciente_nombre}</strong>
              </Typography>
              <Typography variant="body2">
                Etiquetas a imprimir: <strong>{printData.tratamientos?.length || 0}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Formato: 192x112px (múltiplo de 8)
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
              <Typography variant="h6" gutterBottom>
                Estado de Conexión
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                {isConnected ? (
                  <BluetoothConnected color="success" />
                ) : (
                  <Bluetooth color="error" />
                )}
                <Typography>
                  {currentStatus}
                </Typography>
              </Box>
              {currentAction && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {currentAction}
                </Typography>
              )}
              <Button
                variant={isConnected ? "outlined" : "contained"}
                onClick={isConnected ? handleClose : connectPrinter}
                disabled={isConnecting || isPrinting}
                startIcon={isConnecting ? <CircularProgress size={16} /> : <Bluetooth />}
                fullWidth
              >
                {isConnecting ? 'Conectando...' : isConnected ? 'Desconectar' : 'Conectar Impresora'}
              </Button>
            </Paper>
          </Box>
        ) : (
          <Alert severity="info">
            Esperando datos de impresión... Cierre y vuelva a abrir el diálogo.
          </Alert>
        )}

        {/* Barra de progreso */}
        {(isPrinting || printProgress > 0) && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Progreso de Impresión: {printProgress}%
            </Typography>
            <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
              <Box 
                sx={{ 
                  height: 8, 
                  bgcolor: 'primary.main', 
                  borderRadius: 1,
                  width: `${printProgress}%`,
                  transition: 'width 0.3s ease'
                }} 
              />
            </Box>
          </Paper>
        )}

        {/* Mensajes de error */}
        {connectionError && (
          <Alert 
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                Reintentar
              </Button>
            }
          >
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                ❌ Error:
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {connectionError}
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Lista de medicamentos */}
        {printData && printData.tratamientos && printData.tratamientos.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Medicamentos a imprimir ({printData.tratamientos.length})
            </Typography>
            <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
              {printData.tratamientos.map((med, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={med.medicamento}
                    secondary={`Dosis: ${med.dosis} • Duración: ${med.duracion}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Solo errores de debug */}
        {debugLogs.some(log => log.type === 'error') && (
          <Paper sx={{ p: 2, border: '2px solid', borderColor: 'error.main' }}>
            <Typography variant="h6" gutterBottom color="error">
              ❌ Errores Recientes
            </Typography>
            <Box sx={{ maxHeight: 120, overflow: 'auto' }}>
              {debugLogs
                .filter(log => log.type === 'error')
                .map((log, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="error" sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      [{log.timestamp}] {log.message}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isPrinting}
          variant="outlined"
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handlePrintAll}
          variant="contained"
          color="primary"
          disabled={!isConnected || isPrinting || !printData || !printData.tratamientos || printData.tratamientos.length === 0}
          startIcon={isPrinting ? <CircularProgress size={20} /> : <Print />}
          sx={{ minWidth: 200 }}
        >
          {isPrinting ? `Imprimiendo... ${printProgress}%` : 'Imprimir Todas'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NiimbluePrintDialog;