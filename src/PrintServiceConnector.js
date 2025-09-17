// PrintServiceConnector.js
import { NiimbotBluetoothClient } from '@mmote/niimbluelib';
import PrintService from './PrintService';

class PrintServiceConnector {
  constructor() {
    this.niimbotClient = null;
    this.printService = new PrintService();
  }

  async connect() {
    try {
      // Usar niimbluelib para la conexión confiable
      this.niimbotClient = new NiimbotBluetoothClient();
      const device = await this.niimbotClient.connect();
      
      // Pasar el dispositivo conectado a tu PrintService
      const server = await device.gatt.connect();
      const connected = await this.printService.connect(device, server);
      
      return connected;
    } catch (error) {
      console.error('Error en conexión:', error);
      throw error;
    }
  }

  async printMedicamentoHomeopatico(medicamentoData, consultaData) {
    if (!this.printService.characteristic) {
      throw new Error('No conectado a la impresora');
    }
    
    // Usar TU lógica de impresión avanzada
    return await this.printService.printMedicamentoHomeopatico(
      medicamentoData, 
      consultaData
    );
  }

  async disconnect() {
    if (this.niimbotClient) {
      await this.niimbotClient.disconnect();
    }
    this.printService.disconnect();
  }
}

export default PrintServiceConnector;