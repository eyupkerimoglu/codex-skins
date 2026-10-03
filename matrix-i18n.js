/* Matrix-owned text only. Codex writes its resolved UI locale to <html lang>. */
(() => {
  'use strict';
  if(window.MatrixI18n?.version==='6.10.3')return;
  window.MatrixI18n?.dispose();
  const schema={
    nav:['tabs.chats','tabs.files','navigation.recents','action.addToChat','action.edit','project.view'],
    tree:['tree.aria','tree.refresh','tree.loading','tree.empty','tree.more','tree.error'],
    editor:['editor.tools','editor.addFile','editor.workFile','editor.selectCode','editor.selection','editor.saved','editor.unsaved','notice.contextAdded'],
    task:['task.send','task.explain','task.debug','task.refactor','task.optimize','task.tests','task.selectionOnly'],
    prompt:['prompt.project','prompt.file','prompt.fullPath','prompt.lines','prompt.task','prompt.code','prompt.onlySelected','prompt.workGoal','prompt.readGoal'],
    error:['error.path','error.scope','error.localOnly','error.adapter','error.composer','error.selectCode','error.fileTooLarge','error.openFile'],
    monitor:['monitor.rain','monitor.decrease','monitor.increase','monitor.retro','monitor.power','monitor.rainOn','monitor.rainOff','monitor.crt','monitor.crtOn','monitor.crtOff','monitor.cleanCase','monitor.oldCase','monitor.powerOn','monitor.powerOff','monitor.rainLess','monitor.rainMore','monitor.crtLess','monitor.crtMore','monitor.rainLevel','monitor.retroState'],
    state:['state.on','state.off'],
    toggle:['toggle.rainOn','toggle.rainOff','toggle.crtOn','toggle.crtOff'],
    intro:['intro.wake','intro.matrix','intro.rabbit','intro.knock']
  };
  const translations={
    tr:{
      nav:['Sohbetler','Dosyalar','Yakın zamanlılar','Sohbete ekle','Düzenle','{project} görünümü'],
      tree:['{project} dosyaları','Dosya ağacını yenile','Yükleniyor…','Klasör boş','Daha fazla ({count})','Dosyalar yüklenemedi: {message}'],
      editor:['Dosya için AI araçları','Bu dosyayı sohbete ekle','Bu dosyada çalış','Kod seçin','Seçimle çalış ({start}–{end})','Kaydedildi','● Kaydedilmedi','Kod bağlamı mesaj kutusuna eklendi. Göndermeden önce kontrol edin.'],
      task:['Sohbete ekle','Açıkla','Hata ayıkla','Yeniden düzenle','Optimize et','Test yaz','Sadece bu kısmı değiştir'],
      prompt:['Proje','Dosya','Tam yol','Satırlar','Görev','Seçili kod','Yalnızca aşağıdaki seçili satırları değiştir. Diğer satırlara veya dosyalara dokunma.','Bu dosya ana çalışma hedefidir. İstenen değişikliği bu dosyayı okuyarak uygula.','Dosya içeriğini gerektiğinde bu gerçek yol üzerinden oku.'],
      error:['Geçersiz proje yolu','Aktif Codex sohbet bağlamı bulunamadı. Önce bir sohbet açın.','Matrix IDE yerel Codex Desktop gerektirir.','Bu Codex sürümünün dosya/panel API düzeni desteklenmiyor.','Codex mesaj kutusu hazır değil. Önce bir sohbet açın.','Önce editörde kod seçin.','20 MB üzerindeki dosyalar editörde açılmıyor. Dosya ağacı ve sohbet kullanılabilir.','Dosya mevcut sağ panelde açılamadı.'],
      monitor:['Matrix yağmuru','Efekt şiddetini azalt','Efekt şiddetini artır','Eski monitör görünümü','Monitör gücü','1 · Matrix yağmurunu aç','1 · Matrix yağmurunu kapat','CRT paraziti','1 · CRT parazitini aç','1 · CRT parazitini kapat','2 · Temiz monitöre dön','2 · Eski monitör görünümüne geç','Monitörü aç','Monitörü kapat','Yağmur görünürlüğü: {percent} · azalt','Yağmur görünürlüğü: {percent} · artır','CRT parazit şiddeti: {percent} · azalt','CRT parazit şiddeti: {percent} · artır','Yağmur: {percent}','Eski monitör: {state}'],
      state:['açık','kapalı'],toggle:['YAĞMUR AÇIK','YAĞMUR KAPALI','CRT AÇIK','CRT KAPALI'],
      intro:['Uyan, Neo','Matrix seni ele geçirdi','Beyaz tavşanı takip et','Tık, tık, Neo']
    },
    en:{
      nav:['Chats','Files','Recents','Add to chat','Edit','{project} view'],
      tree:['{project} files','Refresh file tree','Loading…','Folder is empty','More ({count})','Could not load files: {message}'],
      editor:['AI tools for this file','Add this file to chat','Work on this file','Select code','Work with selection ({start}–{end})','Saved','● Unsaved','Code context added to the composer. Review it before sending.'],
      task:['Add to chat','Explain','Debug','Refactor','Optimize','Write tests','Change only this selection'],
      prompt:['Project','File','Full path','Lines','Task','Selected code','Change only the selected lines below. Do not change other lines or files.','This file is the main work target. Read it and apply the requested change.','Read the file contents through this actual path when needed.'],
      error:['Invalid project path','Active Codex chat context not found. Open a chat first.','Matrix IDE requires local Codex Desktop.','This Codex version’s file/panel API layout is not supported.','The Codex composer is not ready. Open a chat first.','Select code in the editor first.','Files over 20 MB cannot open in the editor. The file tree and chat remain available.','Could not open the file in the existing right panel.'],
      monitor:['Matrix rain','Decrease effect intensity','Increase effect intensity','Old monitor appearance','Monitor power','1 · Turn Matrix rain on','1 · Turn Matrix rain off','CRT interference','1 · Turn CRT interference on','1 · Turn CRT interference off','2 · Return to the clean monitor','2 · Switch to the old monitor','Turn monitor on','Turn monitor off','Rain visibility: {percent} · decrease','Rain visibility: {percent} · increase','CRT interference intensity: {percent} · decrease','CRT interference intensity: {percent} · increase','Rain: {percent}','Old monitor: {state}'],
      state:['on','off'],toggle:['RAIN ON','RAIN OFF','CRT ON','CRT OFF'],
      intro:['Wake up, Neo','The Matrix has you','Follow the white rabbit','Knock, knock, Neo']
    },
    de:{
      nav:['Chats','Dateien','Zuletzt verwendet','Zum Chat hinzufügen','Bearbeiten','Ansicht für {project}'],
      tree:['Dateien von {project}','Dateibaum aktualisieren','Wird geladen…','Ordner ist leer','Mehr ({count})','Dateien konnten nicht geladen werden: {message}'],
      editor:['KI-Werkzeuge für diese Datei','Diese Datei zum Chat hinzufügen','An dieser Datei arbeiten','Code auswählen','Mit Auswahl arbeiten ({start}–{end})','Gespeichert','● Nicht gespeichert','Codekontext zum Eingabefeld hinzugefügt. Vor dem Senden prüfen.'],
      task:['Zum Chat hinzufügen','Erklären','Fehler beheben','Umstrukturieren','Optimieren','Tests schreiben','Nur diese Auswahl ändern'],
      prompt:['Projekt','Datei','Vollständiger Pfad','Zeilen','Aufgabe','Ausgewählter Code','Ändere nur die unten ausgewählten Zeilen. Ändere keine anderen Zeilen oder Dateien.','Diese Datei ist das Hauptziel. Lies sie und setze die gewünschte Änderung um.','Lies bei Bedarf den Dateiinhalt über diesen tatsächlichen Pfad.'],
      error:['Ungültiger Projektpfad','Aktiver Codex-Chatkontext nicht gefunden. Öffne zuerst einen Chat.','Matrix IDE benötigt die lokale Codex-Desktop-App.','Die Datei-/Panel-API dieser Codex-Version wird nicht unterstützt.','Das Codex-Eingabefeld ist noch nicht bereit. Öffne zuerst einen Chat.','Wähle zuerst Code im Editor aus.','Dateien über 20 MB können nicht im Editor geöffnet werden. Dateibaum und Chat bleiben verfügbar.','Die Datei konnte nicht im vorhandenen rechten Panel geöffnet werden.'],
      monitor:['Matrix-Regen','Effektstärke verringern','Effektstärke erhöhen','Altes Monitorgehäuse','Monitorstrom','1 · Matrix-Regen einschalten','1 · Matrix-Regen ausschalten','CRT-Störungen','1 · CRT-Störungen einschalten','1 · CRT-Störungen ausschalten','2 · Zum sauberen Monitor zurückkehren','2 · Zum alten Monitor wechseln','Monitor einschalten','Monitor ausschalten','Regensichtbarkeit: {percent} · verringern','Regensichtbarkeit: {percent} · erhöhen','CRT-Störungsstärke: {percent} · verringern','CRT-Störungsstärke: {percent} · erhöhen','Regen: {percent}','Alter Monitor: {state}'],
      state:['ein','aus'],toggle:['REGEN EIN','REGEN AUS','CRT EIN','CRT AUS'],
      intro:['Wach auf, Neo','Die Matrix hat dich','Folge dem weißen Kaninchen','Klopf, klopf, Neo']
    },
    fr:{
      nav:['Discussions','Fichiers','Récents','Ajouter à la discussion','Modifier','Vue de {project}'],
      tree:['Fichiers de {project}','Actualiser l’arborescence','Chargement…','Le dossier est vide','Plus ({count})','Impossible de charger les fichiers : {message}'],
      editor:['Outils IA pour ce fichier','Ajouter ce fichier à la discussion','Travailler sur ce fichier','Sélectionner du code','Travailler sur la sélection ({start}–{end})','Enregistré','● Non enregistré','Le contexte du code a été ajouté au champ de saisie. Vérifiez-le avant l’envoi.'],
      task:['Ajouter à la discussion','Expliquer','Déboguer','Restructurer','Optimiser','Écrire des tests','Modifier uniquement cette sélection'],
      prompt:['Projet','Fichier','Chemin complet','Lignes','Tâche','Code sélectionné','Modifie uniquement les lignes sélectionnées ci-dessous. Ne modifie aucune autre ligne ni aucun autre fichier.','Ce fichier est la cible principale. Lis-le et applique la modification demandée.','Lis le contenu du fichier via ce chemin réel si nécessaire.'],
      error:['Chemin de projet invalide','Contexte de discussion Codex introuvable. Ouvrez d’abord une discussion.','Matrix IDE nécessite l’application locale Codex Desktop.','L’API de fichiers et de panneaux de cette version de Codex n’est pas prise en charge.','Le champ de saisie Codex n’est pas prêt. Ouvrez d’abord une discussion.','Sélectionnez d’abord du code dans l’éditeur.','Les fichiers de plus de 20 Mo ne peuvent pas être ouverts dans l’éditeur. L’arborescence et la discussion restent disponibles.','Impossible d’ouvrir le fichier dans le panneau droit existant.'],
      monitor:['Pluie Matrix','Réduire l’intensité de l’effet','Augmenter l’intensité de l’effet','Aspect du vieux moniteur','Alimentation du moniteur','1 · Activer la pluie Matrix','1 · Désactiver la pluie Matrix','Parasites CRT','1 · Activer les parasites CRT','1 · Désactiver les parasites CRT','2 · Revenir au moniteur propre','2 · Passer au vieux moniteur','Allumer le moniteur','Éteindre le moniteur','Visibilité de la pluie : {percent} · réduire','Visibilité de la pluie : {percent} · augmenter','Intensité des parasites CRT : {percent} · réduire','Intensité des parasites CRT : {percent} · augmenter','Pluie : {percent}','Vieux moniteur : {state}'],
      state:['activé','désactivé'],toggle:['PLUIE ACTIVÉE','PLUIE DÉSACTIVÉE','CRT ACTIVÉ','CRT DÉSACTIVÉ'],
      intro:['Réveille-toi, Neo','La Matrix te tient','Suis le lapin blanc','Toc, toc, Neo']
    },
    es:{
      nav:['Chats','Archivos','Recientes','Añadir al chat','Editar','Vista de {project}'],
      tree:['Archivos de {project}','Actualizar árbol de archivos','Cargando…','La carpeta está vacía','Más ({count})','No se pudieron cargar los archivos: {message}'],
      editor:['Herramientas de IA para este archivo','Añadir este archivo al chat','Trabajar en este archivo','Seleccionar código','Trabajar con la selección ({start}–{end})','Guardado','● Sin guardar','El contexto del código se añadió al cuadro de mensaje. Revísalo antes de enviarlo.'],
      task:['Añadir al chat','Explicar','Depurar','Reestructurar','Optimizar','Escribir pruebas','Cambiar solo esta selección'],
      prompt:['Proyecto','Archivo','Ruta completa','Líneas','Tarea','Código seleccionado','Cambia solo las líneas seleccionadas a continuación. No cambies otras líneas ni archivos.','Este archivo es el objetivo principal. Léelo y aplica el cambio solicitado.','Lee el contenido del archivo mediante esta ruta real cuando sea necesario.'],
      error:['Ruta de proyecto no válida','No se encontró el contexto del chat activo de Codex. Abre un chat primero.','Matrix IDE requiere Codex Desktop local.','La API de archivos y paneles de esta versión de Codex no es compatible.','El cuadro de mensaje de Codex no está listo. Abre un chat primero.','Selecciona código en el editor primero.','Los archivos de más de 20 MB no se pueden abrir en el editor. El árbol de archivos y el chat siguen disponibles.','No se pudo abrir el archivo en el panel derecho existente.'],
      monitor:['Lluvia Matrix','Reducir la intensidad del efecto','Aumentar la intensidad del efecto','Aspecto de monitor antiguo','Alimentación del monitor','1 · Activar la lluvia Matrix','1 · Desactivar la lluvia Matrix','Interferencias CRT','1 · Activar las interferencias CRT','1 · Desactivar las interferencias CRT','2 · Volver al monitor limpio','2 · Cambiar al monitor antiguo','Encender el monitor','Apagar el monitor','Visibilidad de la lluvia: {percent} · reducir','Visibilidad de la lluvia: {percent} · aumentar','Intensidad de interferencias CRT: {percent} · reducir','Intensidad de interferencias CRT: {percent} · aumentar','Lluvia: {percent}','Monitor antiguo: {state}'],
      state:['activado','desactivado'],toggle:['LLUVIA ACTIVADA','LLUVIA DESACTIVADA','CRT ACTIVADO','CRT DESACTIVADO'],
      intro:['Despierta, Neo','Matrix te tiene','Sigue al conejo blanco','Toc, toc, Neo']
    },
    it:{
      nav:['Chat','File','Recenti','Aggiungi alla chat','Modifica','Vista di {project}'],
      tree:['File di {project}','Aggiorna albero dei file','Caricamento…','La cartella è vuota','Altro ({count})','Impossibile caricare i file: {message}'],
      editor:['Strumenti IA per questo file','Aggiungi questo file alla chat','Lavora su questo file','Seleziona codice','Lavora sulla selezione ({start}–{end})','Salvato','● Non salvato','Contesto del codice aggiunto al campo del messaggio. Controllalo prima dell’invio.'],
      task:['Aggiungi alla chat','Spiega','Correggi errori','Ristruttura','Ottimizza','Scrivi test','Modifica solo questa selezione'],
      prompt:['Progetto','File','Percorso completo','Righe','Attività','Codice selezionato','Modifica solo le righe selezionate qui sotto. Non modificare altre righe o file.','Questo file è l’obiettivo principale. Leggilo e applica la modifica richiesta.','Leggi il contenuto del file tramite questo percorso reale quando necessario.'],
      error:['Percorso del progetto non valido','Contesto della chat attiva di Codex non trovato. Apri prima una chat.','Matrix IDE richiede Codex Desktop locale.','L’API di file e pannelli di questa versione di Codex non è supportata.','Il campo del messaggio di Codex non è pronto. Apri prima una chat.','Seleziona prima del codice nell’editor.','I file oltre 20 MB non possono essere aperti nell’editor. L’albero dei file e la chat restano disponibili.','Impossibile aprire il file nel pannello destro esistente.'],
      monitor:['Pioggia Matrix','Riduci intensità dell’effetto','Aumenta intensità dell’effetto','Aspetto del vecchio monitor','Alimentazione del monitor','1 · Attiva pioggia Matrix','1 · Disattiva pioggia Matrix','Interferenze CRT','1 · Attiva interferenze CRT','1 · Disattiva interferenze CRT','2 · Torna al monitor pulito','2 · Passa al vecchio monitor','Accendi il monitor','Spegni il monitor','Visibilità della pioggia: {percent} · riduci','Visibilità della pioggia: {percent} · aumenta','Intensità interferenze CRT: {percent} · riduci','Intensità interferenze CRT: {percent} · aumenta','Pioggia: {percent}','Vecchio monitor: {state}'],
      state:['attivo','disattivo'],toggle:['PIOGGIA ATTIVA','PIOGGIA DISATTIVA','CRT ATTIVO','CRT DISATTIVO'],
      intro:['Svegliati, Neo','Matrix ti possiede','Segui il coniglio bianco','Toc, toc, Neo']
    },
    pt:{
      nav:['Conversas','Arquivos','Recentes','Adicionar à conversa','Editar','Visualização de {project}'],
      tree:['Arquivos de {project}','Atualizar árvore de arquivos','Carregando…','A pasta está vazia','Mais ({count})','Não foi possível carregar os arquivos: {message}'],
      editor:['Ferramentas de IA para este arquivo','Adicionar este arquivo à conversa','Trabalhar neste arquivo','Selecionar código','Trabalhar com a seleção ({start}–{end})','Salvo','● Não salvo','O contexto do código foi adicionado à caixa de mensagem. Revise antes de enviar.'],
      task:['Adicionar à conversa','Explicar','Depurar','Reestruturar','Otimizar','Escrever testes','Alterar apenas esta seleção'],
      prompt:['Projeto','Arquivo','Caminho completo','Linhas','Tarefa','Código selecionado','Altere apenas as linhas selecionadas abaixo. Não altere outras linhas ou arquivos.','Este arquivo é o alvo principal. Leia-o e aplique a alteração solicitada.','Leia o conteúdo do arquivo por este caminho real quando necessário.'],
      error:['Caminho de projeto inválido','Contexto da conversa ativa do Codex não encontrado. Abra uma conversa primeiro.','Matrix IDE requer o Codex Desktop local.','A API de arquivos e painéis desta versão do Codex não é compatível.','A caixa de mensagem do Codex não está pronta. Abra uma conversa primeiro.','Selecione código no editor primeiro.','Arquivos com mais de 20 MB não podem ser abertos no editor. A árvore de arquivos e a conversa continuam disponíveis.','Não foi possível abrir o arquivo no painel direito existente.'],
      monitor:['Chuva Matrix','Reduzir intensidade do efeito','Aumentar intensidade do efeito','Aparência de monitor antigo','Alimentação do monitor','1 · Ativar chuva Matrix','1 · Desativar chuva Matrix','Interferência CRT','1 · Ativar interferência CRT','1 · Desativar interferência CRT','2 · Voltar ao monitor limpo','2 · Mudar para o monitor antigo','Ligar monitor','Desligar monitor','Visibilidade da chuva: {percent} · reduzir','Visibilidade da chuva: {percent} · aumentar','Intensidade da interferência CRT: {percent} · reduzir','Intensidade da interferência CRT: {percent} · aumentar','Chuva: {percent}','Monitor antigo: {state}'],
      state:['ativado','desativado'],toggle:['CHUVA ATIVADA','CHUVA DESATIVADA','CRT ATIVADO','CRT DESATIVADO'],
      intro:['Acorde, Neo','Matrix tem você','Siga o coelho branco','Toc, toc, Neo']
    },
    ru:{
      nav:['Чаты','Файлы','Недавние','Добавить в чат','Редактировать','Представление проекта {project}'],
      tree:['Файлы проекта {project}','Обновить дерево файлов','Загрузка…','Папка пуста','Ещё ({count})','Не удалось загрузить файлы: {message}'],
      editor:['ИИ-инструменты для файла','Добавить этот файл в чат','Работать с этим файлом','Выберите код','Работать с выделением ({start}–{end})','Сохранено','● Не сохранено','Контекст кода добавлен в поле сообщения. Проверьте его перед отправкой.'],
      task:['Добавить в чат','Объяснить','Найти и исправить ошибки','Рефакторинг','Оптимизировать','Написать тесты','Изменить только выделение'],
      prompt:['Проект','Файл','Полный путь','Строки','Задача','Выделенный код','Измени только выделенные строки ниже. Не меняй другие строки или файлы.','Этот файл — основная цель работы. Прочитай его и внеси запрошенное изменение.','При необходимости прочитай содержимое файла по этому реальному пути.'],
      error:['Недопустимый путь проекта','Контекст активного чата Codex не найден. Сначала откройте чат.','Для Matrix IDE требуется локальный Codex Desktop.','API файлов и панелей этой версии Codex не поддерживается.','Поле сообщения Codex ещё не готово. Сначала откройте чат.','Сначала выделите код в редакторе.','Файлы больше 20 МБ нельзя открыть в редакторе. Дерево файлов и чат остаются доступными.','Не удалось открыть файл в существующей правой панели.'],
      monitor:['Дождь Matrix','Уменьшить интенсивность эффекта','Увеличить интенсивность эффекта','Вид старого монитора','Питание монитора','1 · Включить дождь Matrix','1 · Выключить дождь Matrix','Помехи ЭЛТ','1 · Включить помехи ЭЛТ','1 · Выключить помехи ЭЛТ','2 · Вернуться к чистому монитору','2 · Переключиться на старый монитор','Включить монитор','Выключить монитор','Видимость дождя: {percent} · уменьшить','Видимость дождя: {percent} · увеличить','Интенсивность помех ЭЛТ: {percent} · уменьшить','Интенсивность помех ЭЛТ: {percent} · увеличить','Дождь: {percent}','Старый монитор: {state}'],
      state:['включён','выключен'],toggle:['ДОЖДЬ ВКЛ','ДОЖДЬ ВЫКЛ','ЭЛТ ВКЛ','ЭЛТ ВЫКЛ'],
      intro:['Проснись, Нео','Ты во власти Матрицы','Следуй за белым кроликом','Тук, тук, Нео']
    },
    'zh-CN':{
      nav:['聊天','文件','最近使用','添加到聊天','编辑','{project} 视图'],
      tree:['{project} 的文件','刷新文件树','正在加载…','文件夹为空','更多（{count}）','无法加载文件：{message}'],
      editor:['此文件的 AI 工具','将此文件添加到聊天','处理此文件','选择代码','处理所选内容（{start}–{end}）','已保存','● 未保存','代码上下文已添加到消息框。发送前请检查。'],
      task:['添加到聊天','解释','调试','重构','优化','编写测试','仅修改所选内容'],
      prompt:['项目','文件','完整路径','行号','任务','所选代码','仅修改下面选中的行。不要修改其他行或文件。','此文件是主要处理目标。请读取文件并应用所请求的更改。','需要时通过此真实路径读取文件内容。'],
      error:['项目路径无效','未找到当前 Codex 聊天上下文。请先打开聊天。','Matrix IDE 需要本地 Codex Desktop。','不支持此 Codex 版本的文件和面板 API。','Codex 消息框尚未就绪。请先打开聊天。','请先在编辑器中选择代码。','超过 20 MB 的文件无法在编辑器中打开。文件树和聊天仍可使用。','无法在现有右侧面板中打开文件。'],
      monitor:['Matrix 代码雨','降低效果强度','提高效果强度','旧显示器外观','显示器电源','1 · 开启 Matrix 代码雨','1 · 关闭 Matrix 代码雨','CRT 干扰','1 · 开启 CRT 干扰','1 · 关闭 CRT 干扰','2 · 恢复干净显示器','2 · 切换为旧显示器','开启显示器','关闭显示器','代码雨可见度：{percent} · 降低','代码雨可见度：{percent} · 提高','CRT 干扰强度：{percent} · 降低','CRT 干扰强度：{percent} · 提高','代码雨：{percent}','旧显示器：{state}'],
      state:['开启','关闭'],toggle:['代码雨 开','代码雨 关','CRT 开','CRT 关'],
      intro:['醒醒，尼奥','母体已掌控你','跟随白兔','叩，叩，尼奥']
    },
    'zh-TW':{
      nav:['聊天','檔案','最近使用','加入聊天','編輯','{project} 檢視'],
      tree:['{project} 的檔案','重新整理檔案樹','載入中…','資料夾是空的','更多（{count}）','無法載入檔案：{message}'],
      editor:['此檔案的 AI 工具','將此檔案加入聊天','處理此檔案','選取程式碼','處理所選內容（{start}–{end}）','已儲存','● 尚未儲存','程式碼脈絡已加入訊息欄。傳送前請檢查。'],
      task:['加入聊天','解釋','除錯','重構','最佳化','撰寫測試','只修改所選內容'],
      prompt:['專案','檔案','完整路徑','行號','任務','所選程式碼','只修改下方選取的行。不要修改其他行或檔案。','此檔案是主要處理目標。請讀取檔案並套用要求的變更。','需要時透過此實際路徑讀取檔案內容。'],
      error:['專案路徑無效','找不到目前的 Codex 聊天脈絡。請先開啟聊天。','Matrix IDE 需要本機 Codex Desktop。','不支援此 Codex 版本的檔案與面板 API。','Codex 訊息欄尚未就緒。請先開啟聊天。','請先在編輯器中選取程式碼。','超過 20 MB 的檔案無法在編輯器中開啟。檔案樹與聊天仍可使用。','無法在現有右側面板中開啟檔案。'],
      monitor:['Matrix 代碼雨','降低效果強度','提高效果強度','舊顯示器外觀','顯示器電源','1 · 開啟 Matrix 代碼雨','1 · 關閉 Matrix 代碼雨','CRT 干擾','1 · 開啟 CRT 干擾','1 · 關閉 CRT 干擾','2 · 恢復乾淨顯示器','2 · 切換為舊顯示器','開啟顯示器','關閉顯示器','代碼雨可見度：{percent} · 降低','代碼雨可見度：{percent} · 提高','CRT 干擾強度：{percent} · 降低','CRT 干擾強度：{percent} · 提高','代碼雨：{percent}','舊顯示器：{state}'],
      state:['開啟','關閉'],toggle:['代碼雨 開','代碼雨 關','CRT 開','CRT 關'],
      intro:['醒醒，尼歐','母體已掌控你','跟隨白兔','叩，叩，尼歐']
    },
    ja:{
      nav:['チャット','ファイル','最近の項目','チャットに追加','編集','{project} の表示'],
      tree:['{project} のファイル','ファイルツリーを更新','読み込み中…','フォルダーは空です','さらに表示（{count}）','ファイルを読み込めませんでした：{message}'],
      editor:['このファイルの AI ツール','このファイルをチャットに追加','このファイルを対象に作業','コードを選択','選択範囲を対象に作業（{start}–{end}）','保存済み','● 未保存','コードのコンテキストを入力欄に追加しました。送信前に確認してください。'],
      task:['チャットに追加','説明','デバッグ','リファクタリング','最適化','テストを作成','この選択範囲のみ変更'],
      prompt:['プロジェクト','ファイル','完全なパス','行','タスク','選択したコード','以下で選択した行のみ変更してください。他の行やファイルは変更しないでください。','このファイルが主な作業対象です。内容を読み、指定の変更を適用してください。','必要に応じて、この実際のパスからファイルの内容を読んでください。'],
      error:['プロジェクトのパスが無効です','アクティブな Codex チャットのコンテキストが見つかりません。先にチャットを開いてください。','Matrix IDE にはローカルの Codex Desktop が必要です。','この Codex バージョンのファイルとパネルの API は未対応です。','Codex の入力欄がまだ準備できていません。先にチャットを開いてください。','先にエディターでコードを選択してください。','20 MB を超えるファイルはエディターで開けません。ファイルツリーとチャットは利用できます。','既存の右側パネルでファイルを開けませんでした。'],
      monitor:['Matrix コードの雨','エフェクトを弱くする','エフェクトを強くする','古いモニターの外観','モニターの電源','1 · Matrix コードの雨をオン','1 · Matrix コードの雨をオフ','CRT ノイズ','1 · CRT ノイズをオン','1 · CRT ノイズをオフ','2 · きれいなモニターに戻す','2 · 古いモニターに切り替える','モニターの電源を入れる','モニターの電源を切る','コードの雨の濃さ：{percent} · 下げる','コードの雨の濃さ：{percent} · 上げる','CRT ノイズの強さ：{percent} · 下げる','CRT ノイズの強さ：{percent} · 上げる','コードの雨：{percent}','古いモニター：{state}'],
      state:['オン','オフ'],toggle:['コードの雨 オン','コードの雨 オフ','CRT オン','CRT オフ'],
      intro:['目を覚ませ、ネオ','マトリックスがお前を捕らえた','白いウサギを追え','トントン、ネオ']
    },
    ko:{
      nav:['채팅','파일','최근 항목','채팅에 추가','편집','{project} 보기'],
      tree:['{project} 파일','파일 트리 새로 고침','불러오는 중…','폴더가 비어 있습니다','더 보기 ({count})','파일을 불러올 수 없습니다: {message}'],
      editor:['이 파일의 AI 도구','이 파일을 채팅에 추가','이 파일 작업','코드 선택','선택 영역 작업 ({start}–{end})','저장됨','● 저장되지 않음','코드 맥락을 메시지 입력란에 추가했습니다. 보내기 전에 확인하세요.'],
      task:['채팅에 추가','설명','디버깅','리팩터링','최적화','테스트 작성','이 선택 영역만 변경'],
      prompt:['프로젝트','파일','전체 경로','행','작업','선택한 코드','아래에서 선택한 행만 변경하세요. 다른 행이나 파일은 변경하지 마세요.','이 파일이 주요 작업 대상입니다. 파일을 읽고 요청한 변경 사항을 적용하세요.','필요할 때 이 실제 경로를 통해 파일 내용을 읽으세요.'],
      error:['잘못된 프로젝트 경로입니다','활성 Codex 채팅 맥락을 찾을 수 없습니다. 먼저 채팅을 여세요.','Matrix IDE에는 로컬 Codex Desktop이 필요합니다.','이 Codex 버전의 파일 및 패널 API는 지원되지 않습니다.','Codex 메시지 입력란이 준비되지 않았습니다. 먼저 채팅을 여세요.','먼저 편집기에서 코드를 선택하세요.','20 MB를 초과하는 파일은 편집기에서 열 수 없습니다. 파일 트리와 채팅은 계속 사용할 수 있습니다.','기존 오른쪽 패널에서 파일을 열 수 없습니다.'],
      monitor:['Matrix 코드 비','효과 강도 줄이기','효과 강도 높이기','오래된 모니터 외관','모니터 전원','1 · Matrix 코드 비 켜기','1 · Matrix 코드 비 끄기','CRT 잡음','1 · CRT 잡음 켜기','1 · CRT 잡음 끄기','2 · 깨끗한 모니터로 돌아가기','2 · 오래된 모니터로 전환','모니터 켜기','모니터 끄기','코드 비 가시성: {percent} · 줄이기','코드 비 가시성: {percent} · 높이기','CRT 잡음 강도: {percent} · 줄이기','CRT 잡음 강도: {percent} · 높이기','코드 비: {percent}','오래된 모니터: {state}'],
      state:['켜짐','꺼짐'],toggle:['코드 비 켜짐','코드 비 꺼짐','CRT 켜짐','CRT 꺼짐'],
      intro:['깨어나라, 네오','매트릭스가 너를 잡았다','흰 토끼를 따라가라','똑똑, 네오']
    }
  };
  schema.skins=['skins.title','skins.matrixDescription','skins.defaultDescription','skins.remember','skins.skip','skins.apply','skins.cancel','skins.button','skins.busy','skins.error'];
  const skinLabels={
    tr:['Codex Skins','CRT monitör, Matrix yağmuru ve IDE','Orijinal Codex görünümü','Bu seçimi hatırla','Başlangıçta bir daha gösterme','Uygula','Vazgeç','Skin seç','Uygulanıyor…','Skin uygulanamadı. Tekrar deneyin.'],
    en:['Codex Skins','CRT monitor, Matrix rain and IDE','Original Codex appearance','Remember this choice','Don’t show at startup again','Apply','Cancel','Choose a skin','Applying…','Could not apply the skin. Try again.'],
    de:['Codex Skins','CRT-Monitor, Matrix-Regen und IDE','Originales Codex-Aussehen','Diese Auswahl merken','Beim Start nicht mehr anzeigen','Anwenden','Abbrechen','Skin auswählen','Wird angewendet…','Skin konnte nicht angewendet werden. Erneut versuchen.'],
    fr:['Codex Skins','Écran CRT, pluie Matrix et IDE','Apparence originale de Codex','Mémoriser ce choix','Ne plus afficher au démarrage','Appliquer','Annuler','Choisir un thème','Application…','Impossible d’appliquer le thème. Réessayez.'],
    es:['Codex Skins','Monitor CRT, lluvia Matrix e IDE','Apariencia original de Codex','Recordar esta elección','No mostrar de nuevo al iniciar','Aplicar','Cancelar','Elegir un tema','Aplicando…','No se pudo aplicar el tema. Inténtalo de nuevo.'],
    it:['Codex Skins','Monitor CRT, pioggia Matrix e IDE','Aspetto originale di Codex','Ricorda questa scelta','Non mostrare più all’avvio','Applica','Annulla','Scegli un tema','Applicazione…','Impossibile applicare il tema. Riprova.'],
    pt:['Codex Skins','Monitor CRT, chuva Matrix e IDE','Aparência original do Codex','Lembrar esta escolha','Não mostrar novamente ao iniciar','Aplicar','Cancelar','Escolher um tema','Aplicando…','Não foi possível aplicar o tema. Tente novamente.'],
    ru:['Codex Skins','ЭЛТ-монитор, дождь Matrix и IDE','Оригинальный вид Codex','Запомнить выбор','Не показывать при запуске','Применить','Отмена','Выбрать тему','Применение…','Не удалось применить тему. Повторите попытку.'],
    'zh-CN':['Codex Skins','CRT 显示器、Matrix 代码雨和 IDE','Codex 原始外观','记住此选择','启动时不再显示','应用','取消','选择皮肤','正在应用…','无法应用皮肤，请重试。'],
    'zh-TW':['Codex Skins','CRT 螢幕、Matrix 代碼雨和 IDE','Codex 原始外觀','記住此選擇','啟動時不再顯示','套用','取消','選擇外觀','正在套用…','無法套用外觀，請重試。'],
    ja:['Codex Skins','CRT モニター、Matrix レイン、IDE','Codex 本来の外観','この選択を記憶する','起動時に表示しない','適用','キャンセル','スキンを選択','適用中…','スキンを適用できませんでした。再試行してください。'],
    ko:['Codex Skins','CRT 모니터, Matrix 코드 비, IDE','Codex 기본 모양','이 선택 기억하기','시작할 때 다시 표시하지 않기','적용','취소','스킨 선택','적용 중…','스킨을 적용할 수 없습니다. 다시 시도하세요.']
  };
  const managerKeys=['noFeatures','rainFeature','intensityFeature','retroFeature','powerFeature','ideFeature','close'];
  schema.skins.push(...managerKeys.map(key=>'skins.'+key));
  const managerLabels={
    tr:['Ek özellik yok','Rain / CRT efektini aç veya kapat','Efekt yoğunluğunu azalt veya artır','Clean / retro görünüm','Ekranı karart veya aç','Dosya ağacı ve sağ panelde kod editörü','Kapat'],
    en:['No extra features','Toggle Rain / CRT effects','Decrease or increase effect intensity','Clean / retro appearance','Turn the screen off or on','File tree and code editor in the right panel','Close'],
    de:['Keine Zusatzfunktionen','Regen / CRT-Effekte ein- oder ausschalten','Effektintensität verringern oder erhöhen','Sauberes / Retro-Aussehen','Bildschirm aus- oder einschalten','Dateibaum und Code-Editor im rechten Bereich','Schließen'],
    fr:['Aucune fonctionnalité supplémentaire','Activer ou désactiver les effets pluie / CRT','Réduire ou augmenter l’intensité des effets','Apparence propre / rétro','Éteindre ou allumer l’écran','Arborescence et éditeur de code dans le panneau droit','Fermer'],
    es:['Sin funciones adicionales','Activar o desactivar efectos de lluvia / CRT','Reducir o aumentar la intensidad del efecto','Aspecto limpio / retro','Apagar o encender la pantalla','Árbol de archivos y editor de código en el panel derecho','Cerrar'],
    it:['Nessuna funzione aggiuntiva','Attiva o disattiva gli effetti pioggia / CRT','Riduci o aumenta l’intensità degli effetti','Aspetto pulito / rétro','Spegni o accendi lo schermo','Albero dei file ed editor di codice nel pannello destro','Chiudi'],
    pt:['Sem funcionalidades adicionais','Ativar ou desativar efeitos de chuva / CRT','Diminuir ou aumentar a intensidade do efeito','Aparência limpa / retrô','Desligar ou ligar a tela','Árvore de arquivos e editor de código no painel direito','Fechar'],
    ru:['Нет дополнительных функций','Включить или выключить дождь / ЭЛТ-эффекты','Уменьшить или увеличить интенсивность эффектов','Чистый / ретро-вид','Выключить или включить экран','Дерево файлов и редактор кода в правой панели','Закрыть'],
    'zh-CN':['没有额外功能','开启或关闭代码雨 / CRT 效果','降低或提高效果强度','全新 / 复古外观','关闭或开启屏幕','文件树和右侧面板代码编辑器','关闭'],
    'zh-TW':['沒有額外功能','開啟或關閉代碼雨 / CRT 效果','降低或提高效果強度','全新 / 復古外觀','關閉或開啟螢幕','檔案樹和右側面板程式碼編輯器','關閉'],
    ja:['追加機能はありません','レイン / CRT エフェクトのオン・オフ','エフェクトの強度を下げる・上げる','新品 / レトロの外観','画面をオフ・オンにする','ファイルツリーと右パネルのコードエディター','閉じる'],
    ko:['추가 기능 없음','코드 비 / CRT 효과 켜기 또는 끄기','효과 강도 줄이기 또는 높이기','새 제품 / 레트로 외관','화면 끄기 또는 켜기','파일 트리 및 오른쪽 패널 코드 편집기','닫기']
  };
  for(const locale of Object.keys(translations))translations[locale].skins=[...skinLabels[locale],...managerLabels[locale]];
  const locales=Object.freeze(Object.keys(translations));
  const messages=Object.freeze(Object.fromEntries(locales.map(locale=>{
    const entries=[];
    for(const [section,keys]of Object.entries(schema)){
      // The film's terminal sequence always uses its original English wording.
      const values=translations[section==='intro'?'en':locale][section];
      if(values?.length!==keys.length)throw Error(`Matrix i18n dictionary mismatch: ${locale}/${section}`);
      keys.forEach((key,index)=>entries.push([key,values[index]]));
    }
    return [locale,Object.freeze(Object.fromEntries(entries))];
  })));
  function resolveLocale(value){
    const tag=String(value||'').trim().replace(/_/g,'-').toLowerCase();
    if(!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(tag))return 'en';
    const parts=tag.split('-'),language=parts[0];
    if(language==='zh')return parts.includes('hant') || (!parts.includes('hans')&&parts.some(x=>['tw','hk','mo'].includes(x)))?'zh-TW':'zh-CN';
    return locales.includes(language)?language:'en';
  }
  const readLocale=()=>resolveLocale(document.documentElement.lang||navigator.language);
  let locale=readLocale(),queued=false,disposed=false,lastOsd=null;
  const subscribers=new Set();
  function t(key,params={}){
    const template=messages[locale][key]??messages.en[key];
    if(template==null)throw Error(`Unknown Matrix i18n key: ${key}`);
    return template.replace(/\{(\w+)\}/g,(_,name)=>String(params[name]??`{${name}}`));
  }
  const percent=value=>new Intl.NumberFormat(locale,{style:'percent',maximumFractionDigits:0}).format(value);
  function bind(element,key,params={},attribute='textContent'){
    const token=attribute==='textContent'?'text':attribute;
    element.setAttribute('data-matrix-i18n','');
    const data=JSON.stringify({key,params});
    const name='data-mx-i18n-'+token;
    if(element.getAttribute(name)!==data)element.setAttribute(name,data);
    apply(element,attribute,{key,params});
    return element;
  }
  function apply(element,attribute,spec){
    const value=t(spec.key,spec.params);
    if(attribute==='textContent'){if(element.textContent!==value)element.textContent=value;}
    else if(element.getAttribute(attribute)!==value)element.setAttribute(attribute,value);
  }
  function updateBindings(){
    for(const element of document.querySelectorAll('[data-matrix-i18n]')){
      for(const attr of element.attributes){
        if(!attr.name.startsWith('data-mx-i18n-'))continue;
        const token=attr.name.slice(13);
        apply(element,token==='text'?'textContent':token,JSON.parse(attr.value));
      }
    }
  }
  function syncMonitor(){
    const root=document.documentElement,retro=root.classList.contains('mx-monitor-retro'),off=root.classList.contains('mx-monitor-off');
    const noise=document.getElementById('matrix-main-crt')?.matrixCrtNoise?.getState();
    const rain=!root.classList.contains('mx-rain-off'),enabled=retro?!!noise?.enabled:rain;
    const level=retro?(noise?.level??.48):(Number(root.style.getPropertyValue('--mx-rain-opacity'))||.48);
    const bindId=(id,key,params={},attribute='title')=>{const el=document.getElementById(id);if(el)bind(el,key,params,attribute)};
    const toggle=document.getElementById('matrixskin-v32-rain-toggle');
    if(toggle){bind(toggle,'toggle.'+(retro?'crt':'rain')+(enabled?'On':'Off'));bind(toggle,'monitor.'+(retro?'crt':'rain')+(enabled?'Off':'On'),{},'title');bind(toggle,'monitor.'+(retro?'crt':'rain'),{},'aria-label');}
    bindId('matrix-monitor-rain-key','monitor.'+(retro?'crt':'rain'),{},'aria-label');
    bindId('matrix-monitor-rain-key','monitor.'+(retro?'crt':'rain')+(enabled?'Off':'On'));
    for(const [id,direction]of [['rain-less','Less'],['rain-more','More']]){
      bindId('matrix-monitor-'+id,'monitor.'+(retro?'crt':'rain')+direction,{percent:percent(level)});
      bindId('matrix-monitor-'+id,'monitor.'+(direction==='Less'?'decrease':'increase'),{},'aria-label');
    }
    bindId('matrix-monitor-retro',retro?'monitor.cleanCase':'monitor.oldCase');bindId('matrix-monitor-retro','monitor.retro',{},'aria-label');
    bindId('matrix-monitor-power',off?'monitor.powerOn':'monitor.powerOff');bindId('matrix-monitor-power','monitor.power',{},'aria-label');
    const osd=document.getElementById('matrix-monitor-osd');
    if(osd&&!osd.hidden&&lastOsd)bind(osd,lastOsd,lastOsd==='monitor.rainLevel'?{percent:percent(level)}:{state:t(retro?'state.on':'state.off')});
  }
  function refresh(){
    queued=false;if(disposed)return;
    const next=readLocale(),changed=next!==locale;locale=next;
    updateBindings();syncMonitor();
    if(changed){for(const fn of subscribers){try{fn(locale)}catch(e){console.warn('[Matrix i18n]',e)}}}
  }
  function queue(){if(!queued&&!disposed){queued=true;queueMicrotask(refresh)}}
  const monitorId=/^(matrix-monitor-(?:rain-key|rain-less|rain-more|retro|power|osd)|matrixskin-v32-rain-toggle)$/;
  const observer=new MutationObserver(records=>{
    if(records.some(r=>r.target===document.documentElement||monitorId.test(r.target.id||'')||
      (r.type==='childList'&&[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('[data-matrix-i18n]')||n.querySelector?.('[data-matrix-i18n]')||monitorId.test(n.id||''))))))queue();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['lang','class','style','title','aria-label','hidden']});
  const click=event=>{
    const id=event.target.closest?.('.mx-monitor-key')?.id;
    if(id==='matrix-monitor-retro')lastOsd='monitor.retroState';
    else if((id==='matrix-monitor-rain-less'||id==='matrix-monitor-rain-more')&&!document.documentElement.classList.contains('mx-monitor-retro'))lastOsd='monitor.rainLevel';
    if(id||event.target.id==='matrixskin-v32-rain-toggle')queue();
  };
  document.addEventListener('click',click,true);
  window.MatrixI18n={version:'6.10.4',locales,messages,get locale(){return locale},t,percent,bind,resolveLocale,refresh,syncMonitor,
    subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn)},
    dispose(){disposed=true;observer.disconnect();subscribers.clear();document.removeEventListener('click',click,true);if(window.MatrixI18n===this)delete window.MatrixI18n}
  };
  refresh();
})();
