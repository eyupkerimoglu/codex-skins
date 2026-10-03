# Codex Skins

**Codex Desktop için açık kaynak skin ve üretkenlik eklentileri.**

**Geliştirici: Eyra**  
GitHub: **@eyupkerimoglu**  
Telegram: **@eyrafx**

[English README](README.md)

> **Bağımsız topluluk projesidir.** OpenAI ile resmi bağlantısı veya onayı yoktur.

## Codex Skins nedir?

Codex Skins, orijinal Codex çalışma akışını korurken Codex Desktop'a görsel temalar ve IDE benzeri üretkenlik araçları ekler.

İlk sürümde **Matrix CRT** skini; proje dosya ağacı, yerleşik kod görüntüleme/düzenleme ve seçili kodu doğrudan Codex sohbetine gönderme özellikleriyle birlikte gelir.

## Mevcut Skin — Matrix CRT

Matrix CRT, Codex Desktop'ı Matrix estetiğinden esinlenen etkileşimli retro CRT çalışma alanına dönüştürür.

### Öne çıkan özellikler

- Etkileşimli CRT tarzı Matrix arayüzü
- Yoğunluğu ayarlanabilen Matrix Rain efekti
- İşlevsel monitör düğmeleri
- **Matrix** ve **Default Codex** seçenekli Skin Manager
- Tek tıkla orijinal Codex görünümüne dönüş
- Proje içinde **Sohbetler / Dosyalar** ayrımı
- VS Code benzeri proje dosya ağacı
- Codex'in mevcut sağ panelinde yerleşik kod görüntüleyici/editör
- Syntax renklendirme
- Çoklu dosya sekmeleri
- Arama, düzenleme, kaydetme, undo ve redo
- Seçili kodu doğrudan Codex sohbetine ekleme
- Seçili kodu Codex ile düzenleme
- Çok dilli özel arayüz
- Windows installer ve uninstaller

## Matrix Kontrolleri

| Kontrol | İşlev |
|---|---|
| `1` | Matrix efektini aç/kapat |
| `← / →` | Efekt yoğunluğunu azalt/artır |
| `2` | Monitör görünümünü değiştir |
| `Power` | CRT ekranını karart/aç |
| Palet ikonu | Skin Manager'ı aç |

## Ekran Görüntüleri

Ekran görüntülerini repoda `assets/` klasörüne ekleyin:

```text
assets/matrix-crt.png
assets/file-tree.png
assets/code-editor.png
```

Sonra README içinde şöyle gösterin:

```md
![Matrix CRT](assets/matrix-crt.png)
![Proje dosya ağacı](assets/file-tree.png)
![Yerleşik kod editörü](assets/code-editor.png)
```

## Demo

Kısa demo videosunu GitHub Release'e ekleyebilir veya repoya koyabilirsiniz.

Önerilen dosya adı:

```text
Codex_Skins_Demo.mp4
```

## Kurulum

1. Önce resmi **Codex Desktop** uygulamasını kurun.
2. **Releases** bölümünden en güncel `CodexSkinsSetup.exe` dosyasını indirin.
3. Installer'ı çalıştırın.
4. Masaüstü veya Başlat menüsündeki **Codex Skins** kısayolundan açın.
5. Skin Manager'dan **Matrix** veya **Default Codex** seçin.

Normal kullanıcı kurulumu için yönetici yetkisi gerekmez.

## Skin Manager

Skin Manager üzerinden:

- aktif skin seçilebilir
- son seçim hatırlanabilir
- Skin Manager'ın başlangıçta açılması kapatılabilir
- Codex içindeki palet ikonundan tekrar açılabilir

Skin listesi registry/config üzerinden dinamik üretildiği için ileride yeni skinler manager yeniden tasarlanmadan eklenebilir.

## Diller

Codex Skins'in özel arayüzü şu dilleri destekler:

- Türkçe
- İngilizce
- Almanca
- Fransızca
- İspanyolca
- İtalyanca
- Portekizce
- Rusça
- Basitleştirilmiş Çince
- Geleneksel Çince
- Japonca
- Korece

Desteklenmeyen dillerde İngilizce kullanılır.

## Kaldırma

Windows'taki **Codex Skins** kaldırma girişini veya paketteki `Uninstall.exe` dosyasını kullanın.

Resmi Codex kurulumu ayrı kalır.

## Yol Haritası

Yeni skinler planlanıyor. Gelecek skinler aynı Skin Manager üzerinden kendi görünümünü, kontrollerini ve kısa yollarını sunabilecek.

## Gereksinimler

- Windows
- Resmi Codex Desktop kurulumu

## Katkı

Issue, hata bildirimi ve pull request'ler kabul edilir.

## Lisans

**Apache License 2.0** ile lisanslanmıştır. Ayrıntı için [LICENSE](LICENSE).

---

**Created by Eyra**  
GitHub: **@eyupkerimoglu**  
Telegram: **@eyrafx**
