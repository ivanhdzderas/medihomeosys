// PrintService.js (modificado)
import { NiimbotBluetoothClient } from '@mmote/niimbluelib';

class PrintService {
  constructor() {
    this.niimbotClient = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.niimbotClient = new NiimbotBluetoothClient();
      await this.niimbotClient.connect();
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Error conectando:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async writeData(data) {
    if (!this.isConnected || !this.niimbotClient) {
      throw new Error('No conectado a la impresora');
    }

    // Convertir Uint8Array a string para niimbluelib
    const text = new TextDecoder().decode(data);
    await this.niimbotClient.printText(text);
  }

  // Mantener TODAS tus funciones existentes de formato
  async initialize() {
    const initData = new Uint8Array([0x1B, 0x40]);
    return await this.writeData(initData);
  }

  async setBold(enabled) {
    const boldCmd = new Uint8Array([0x1B, 0x21, enabled ? 0x08 : 0x00]);
    await this.writeData(boldCmd);
  }

  // ... (mantener todas tus otras funciones igual)

  async printMedicamentoHomeopatico(medicamentoData, consultaData) {
    // Tu implementación existente PERO usando writeData mejorado
    await this.initialize();
    
    const densityCmd = new Uint8Array([0x1B, 0x21, 15]);
    await this.writeData(densityCmd);
    
    // ... resto de tu lógica original
  }

  async disconnect() {
    if (this.niimbotClient) {
      await this.niimbotClient.disconnect();
    }
    this.isConnected = false;
  }
}

export default PrintService;