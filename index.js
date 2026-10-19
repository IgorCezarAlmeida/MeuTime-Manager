import { registerRootComponent } from 'expo';
import AppMobile from './src/react-native/AppMobile';

// Registra o componente raiz para o Expo Go e builds nativos Android/iOS
registerRootComponent(AppMobile);
