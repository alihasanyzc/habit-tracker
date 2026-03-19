# Habition

React Native / Expo ile geliştirilen alışkanlık takip uygulaması. Tasarım Figma Make ile oluşturuldu ve Figma MCP üzerinden Cursor'a aktarıldı.

---

## 📱 Ekranlar

| Ekran | Açıklama |
|---|---|
| **Home** | Haftalık takvim + swipeable alışkanlık kartları |
| **Stats** | Haftalık / Aylık / Yıllık görünüm, GitHub heatmap |
| **Create** | Yeni alışkanlık oluşturma, ikon & renk seçici, takvim |
| **Habit** | Tüm alışkanlıklar listesi, filtre ve yönetim |
| **Profile** | Gradient header, düzenlenebilir isim, ayarlar menüsü |

---

## 🛠 Teknolojiler

- [Expo SDK 54](https://expo.dev)
- [React Native](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org) — Bottom Tabs
- [react-native-svg](https://github.com/software-mansion/react-native-svg) — Grafikler
- [expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) — Gradient
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)
- [Figma MCP](https://developers.figma.com/docs/figma-mcp-server/) — Tasarım → Kod

---

## Kurulum

```bash
# Bağımlılıkları yükle
npm ci

# Geliştirme sunucusunu başlat
npm start
```

Expo Go uygulamasıyla QR kodu tarat (iOS / Android):

```bash
npm run ios      # iOS Simülatör
npm run android  # Android Emülatör
npm run web      # Web tarayıcı
```

---

## Proje Yapısı

```
habition/
├── App.tsx                    # Giriş noktası
├── navigation/
│   └── AppNavigator.tsx       # Bottom tab navigator
├── screens/
│   ├── HomeScreen.tsx         # Ana sayfa
│   ├── StatsScreen.tsx        # İstatistikler
│   ├── CreateScreen.tsx       # Alışkanlık oluştur
│   └── ProfileScreen.tsx      # Profil
└── package.json
```

---

## Gereksinimler

- Node.js 18+
- npm
- iOS: Xcode (simülatör için)
- Android: Android Studio (emülatör için)
- Fiziksel cihaz: [Expo Go](https://expo.dev/client) (güncel sürüm)

---

## 🎨 Tasarım

Tasarım [Figma Make](https://www.figma.com/make/) ile oluşturuldu ve [Figma MCP Server](https://developers.figma.com/docs/figma-mcp-server/) aracılığıyla Cursor IDE'ye bağlandı.

**Renk Paleti:**
- `#FFFFFF` / `#F6EFEA` — Arka planlar (60%)
- `#EFE5DD` — İkincil yüzeyler (30%)
- `#FF8A1F` — Turuncu vurgu (10%)

---

## 📄 Lisans

MIT
