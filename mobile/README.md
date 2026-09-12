# Norte Mobile

App nativo do Norte para iPhone e iPad, construído com React Native + Expo.

## Direção

O app é voice-first e será o corpo do Norte. O motor adaptativo fica separado da camada de IA.

- `src/engine/types.ts`: modelo de pessoa, estado, observações, hipóteses e decisões.
- `src/engine/norteEngine.ts`: primeira versão determinística do cérebro.
- `App.tsx`: interface inicial e simulação do protocolo de despertar.

## Próximas integrações

1. Alarmes nativos e protocolo de despertar.
2. Conversação por voz bidirecional.
3. Calendário e compromissos.
4. Memória persistente e sincronização.
5. Contexto do dispositivo, sempre com permissões explícitas.
6. Camada de IA por provedor, sem acoplar o cérebro ao Gemini.

## Distribuição

O projeto usa EAS para gerar builds iOS. Depois de configurar uma conta Apple Developer e o App Store Connect, o build pode ser enviado ao TestFlight e, após revisão da Apple, à App Store.
