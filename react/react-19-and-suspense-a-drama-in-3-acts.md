<script setup>
import Tweet from "vue-tweet";
</script>

# React 19 釋放候選版：Suspense 引發的三部曲

> 本篇文章翻自 [React 19 and Suspense - A Drama in 3 Acts](https://tkdodo.eu/blog/react-19-and-suspense-a-drama-in-3-acts)  
> 謝謝 [@TkDodo](https://github.com/tkdodo) 撰寫的優質系列文章，並且開放各方翻譯。如果有詞不達意或錯誤的地方歡迎指教 👋

對於我來說，上週是一場雲霄飛車般的體驗 🎢（2024.06.16 的前一週），這週發生了許多好的壞的事情，而其中最重要的莫過於全球最大的 React 大會：React Summit 正在進行。

我將會嘗試依照順序，一步一步解釋發生了什麼，以及我們可以從中學到什麼。為了做到這一點必須時間拉回到今年四月。

## React 19 發佈候選版

4 月 25 日是一個好日子，React 宣佈了 19 的 RC 版（一個專門用來收集反饋，為下一次主要發布做準備的版本）。

我非常興奮，因為這個版本中有很多好東西。從新的 hooks 到 `use` 運算符，從 server action 到 ref 屬性，從更好的 hydration 錯誤訊息到 ref 的 cleanup function，從更好的 `useRef` 型別到 `useLayoutEffect` 終於不再在伺服器上顯示警告，當然還有實驗性的 React 編譯器。🚀

這個版本充滿了好東西，我迫不及待地想升級 React Query 來看看是否有任何問題。不過當時非常忙碌於工作和完成 [🔮 query.gg](https://query.gg/?s=dom) 課程，但大約一個月後，我們發佈了與React 19兼容的v5.39.0版本。

這個版本充滿了好東西，我迫不及待地想升級React Query來看看是否有任何問題。當時我非常忙於工作和完成🔮 query.gg課程，但大約一個月後，我們發佈了與 React 19 兼容的 `v5.39.0` 版本。

<Tweet tweet-id="1794442417195594233" theme='dark' width=400 />

到目前為止沒遇到什麼需要深入研究的問題，我認為這個版本將成為自 hooks 引入以來最好的 React 版本，直到我注意到 suspense 的一些奇怪的行為。

## 了解 Suspense 的新行為

先聲明第一個發現這個問題的人不是我，感謝 Gabriel Valfridsson，據我所知他在 RC 公告發佈後一天，就發現了這種新行為。

<Tweet tweet-id="1783623489351553366" theme='dark' width=400 />

有趣的是我看到了這條推文，甚至還評論了它，但當時並沒有多想。正如我所說，當時非常忙碌於課程的製作，預計事情告一段落才開始研究 React 19。

所以在 React Query 本身進行 React 19 升級後，我繼續進行課程中的 suspense 課程。其中的一個例子展示如何同時顯示內容，但仍然並行發送所有請求。根據 React 文件，我們可以通過將兩個組件作為兄弟節點放入同一個 suspense 邊界來實現這一點。例子大致如下。

```jsx suspense-with-two-children
export default function App() {
  return (
    <Suspense fallback={<p>...</p>}>
      <RepoData name="tanstack/query" />
      <RepoData name="tanstack/table" />
    </Suspense>
  );
}
```

工作的原理是當 React 看到第一個子節點會 suspend，所以它知道必須顯示 `fallback` 內容。然而它仍然繼續渲染其他兄弟節點，以防其他節點也會 suspend，因此 React 可以“收集”所有的 promise。

非常棒的特性！這意味即使每個兄弟節點包含不同的異步操作，仍然可以組合成一個組件，並且在獲取的過程中保持並行處理，而不會變成🍿爆米花 UI🍿（即屏幕上的多個部分一個接一個地彈出）。

一個更完整的例子可能如下：

```jsx app-with-suspense
export default function App() {
  return (
    <Suspense fallback={<p>...</p>}>
      <Header />
      <Navbar />
      <main>
        <Content />
      </main>
      <Footer />
    </Suspense>
  )
}
```

這些部份或全部的組件可以執行資料的獲取，當所有的資料的到齊後，一次行地將 UI 顯示出來。

另一個優點是可以稍後增加資料獲取的邏輯，不需再次處理 Pending 狀態的呈現。例如現在的 \<Footer /> 組件不會抓取數據，但後續我們對它添加資料獲取的邏輯，它依然能正常運作。如果我們認為該組件的數據獲取沒那麼重要，總是可以將組件包裹在它自己的 suspense 邊界中。

```jsx nested-suspense
export default function App() {
  return (
    <Suspense fallback={<p>...</p>}>
      <Header />
      <Navbar />
      <main>
        <Content />
      </main>
      <Suspense fallback={<p>...</p>}>
        <Footer />
      </Suspense>
    </Suspense>
  )
}
```

現在 \<Footer /> 在獲取資料時不再阻止渲染主內容。這是非常強大並與 React 提倡 "component composition above anything else" 的理念一致。

---

我模糊地記得在推特上看到過有關 React 19 中 suspense 行為改變的推文，所以為了確保行為與課程的描述一致，我在課程中嘗試新 RC 版本。令我驚訝的是：suspense 的行為完全不同，在 RC 版本中它創建了瀑布式的請求，而非並行的數據請求。💦

這種行為令我非常震驚，以至於當時我唯一能想到的就是跳上推特並標記一些 React 核心團隊成員。

<Tweet tweet-id="1800501040766144676" theme='dark' width=400 />

這條推文引發了推特上的熱烈討論。我們很快發現這不是一個臭蟲，而是一個有意為之的改變，這引起了不少憤怒。

### 為什麼會這麼做？

當然改變都是有原因的，而原因是為了一些情況下的性能改進。繼續渲染已經 suspend 組件的兄弟節點是有成本的，它會阻止 `fallback` 內容的顯示。考慮以下例子：

```jsx expensive-sibling
export default function App() {
  return (
    <Suspense fallback={<p>...</p>}>
      <SuspendingComponent />
      <ExpensiveComponent />
    </Suspense>
  )
}
```

假設 \<ExpensiveComponent /> 需要更多的時間來渲染，也許它是一個巨大的子樹，但其本身並不需要 suspend。現在當 React 渲染到這裡的時候，雖然因為 \<SuspendingComponent /> 已經 suspend 了，所以最終需要顯示的東西只有 `fallback` 內容。然而它只能等到執行完所有在 suspense 邊界內組件的渲染後才能顯示，因此必須等待 \<ExpensiveComponent /> 完成渲染。更浪費資源的是 \<ExpensiveComponent /> 的渲染結果將被丟棄，最終只顯示 `fallback` 內容。

考慮到這樣的例子時，預設渲染 suspend 組件的兄弟節點是純粹的開銷浪費，因為它永遠不會產生有意義的輸出，所以 React 19 刪除了這個功能以獲得即時加載狀態。

當然如果立即 suspend，React 將不會知道其他兄弟節點需要啟動資料獲取（例如使用useSuspenseQuery），因此導致瀑布式的資料請求。這意味著為了模仿舊有的行為，你必須引入其他的 suspense 邊界。

### Fetch-on-render vs. Render-as-you-fetch

在 React 中，當一個元件發起資料請求時，這通常被稱為 fetch-on-render，這也是大多數開發者在日常開發中常用的方式，雖然這並不是最佳的做法。即使同一個 suspense 邊界內的兄弟元件是並行預渲染的，但如果在同一個 React 元件中調用兩次 useSuspenseQuery，或者存在父子關係的元件，你仍然無法避免出現「瀑布效應」。

因此 React 團隊建議的做法是提前發起資料請求，例如在路由載入器（route loaders）或伺服器元件（server components）中，讓 suspense 僅僅使用資源，而不是自己發起 promise。這種做法通常稱為 render-as-you-fetch。

<Tweet tweet-id="1800894630952894521" theme='dark' width=400 />

以下是使用 TanStack Router 和 TanStack Query 的範例：

```jsx prefetch-in-route-loader
export const Route = createFileRoute('/')({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(repoOptions('tanstack/query'));
    queryClient.ensureQueryData(repoOptions('tanstack/table'));
  },
  component: () => (
    <Suspense fallback={<p>Loading...</p>}>
      <RepoData name="tanstack/query" />
      <RepoData name="tanstack/table" />
    </Suspense>
  ),
});
```

這個範例利用路由載入器確保在元件渲染之前，事先發起兩個查詢請求。因此當 React 開始渲染 suspense 子元件時，不論是渲染第二個 RepoData 元件還是沒有，它都不會觸發新的請求，而是會使用已經在執行的 promise。這種情況下 React 19 會使我們的應用稍微更快，因為它需要處理的工作更少，不會產生不必要的延遲。

### 然而並非所有操作都是資料請求

無論 Suspense 如何運作，提前進行資料的請求（hoisting your data requirements）都是一個好主意，也建議這樣做。然而隨著 React 19 的變更，這樣的實做幾乎變得是必須的。

此外從 React Query 中我們也學到了，並不是所有的非同步操作都是資料請求，例如使用 React.lazy 進行 code-splitting 時，你的應用程式會類似這樣寫的。

```jsx
const Header = lazy(() => import('./Header.tsx'));
const Navbar = lazy(() => import('./Navbar.tsx'));
const Content = lazy(() => import('./Content.tsx'));
const Footer = lazy(() => import('./Footer.tsx'));

export default function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Header />
      <Navbar />
      <main>
        <Content />
      </main>
      <Footer />
    </Suspense>
  );
}
```

在更新後的 React 版本，所有的動態匯入（dynamic imports）將會是瀑布式的加載。雖然從技術的角度來說，你可以預加載這些動態匯入，但如果為了獲得良好的效能而強制這麼做，這樣會違背 React Suspense 和 component composition 的理念初衷，因為現在 `App` 需要了解其所有子元件中的所有非同步操作。

## 升級並延期發布

對於這個改動隨著時間推移網路上出現了許多驚訝和擔憂。分享出來的[截圖](https://github.com/facebook/react/pull/26380#issuecomment-2166178673)展示在 React 18 中幾乎所有請求都能並行執行的應用，到了 React 19 則完全變成了瀑布式的請求結果。維護 react-three-fiber 的 [Poimandres（Open source developer collective）](https://github.com/pmndrs)的開發者們也為此感到不安，因為這個庫大量依賴非同步工作，並利用當前的 Suspense 行為。甚至討論中出現了關於是否要分叉 React 當這一改動真的進入 React v19。

此時我已經在阿姆斯特丹參加 React Summit。會上，我們在 React 生態系貢獻者峰會中討論這一改動，與會者們對此反應各異，有驚訝，有擔憂，也有人感到沮喪。React 核心團隊則堅定地解釋這一改動是為了[更好的權衡](https://x.com/rickhanlonii/status/1800894630952894521)，能提高效能，並強調開發者應該 hoist data requirements。此外他們提到官方的 Suspense 支援[從未在客戶端釋出](https://x.com/sebmarkbage/status/1801258093327593717)（儘管即使這是真的，我認識的每個人都誤解了）。

那天晚上，我有機會與 Sathya Gunasekaran 交談，他是 React 編譯器和 v19 的開發人員之一。

<Tweet tweet-id="1801364944111153388" theme='dark' width=400 />

他向我保證，React 團隊非常關心社群，這次他們可能低估 Suspense 改動對於客戶端的影響。

第二天，React 團隊開會並決定暫緩發佈

<Tweet tweet-id="1801663976973209620" theme='dark' width=400 />

React 團隊在此階段接受反饋並做出回應，推遲已經宣布並在會議上展示的版本發佈，這個重大的舉動讓參與其中的每個人都非常感激。我很高興能與 React 團隊一起努力，找到一個好的折衷方案。

## 學習

從這一切中我學到了幾件事。首先，在最終版本發布之前嘗試早期版本是一個非常好的主意，特別是如果團隊準備接受反饋並採取行動。向 React 團隊致敬——我真的希望自己能更早給予反饋。

接著，我和其他維護者都發現，我們需要一個與 React 團隊溝通的良好渠道 。React 18 工作小組可能是我們在這方面擁有的最佳例子，這整個事件表明，如果能有類似於 React 19（以及未來 React 發布版本）的工作小組，那將會非常有幫助。也許是一個永久的工作小組？

顯而易見但值得一提的是：在 Twitter 上互相喊話並無助益。我對於自己參與的任何不冷靜、不客觀的溝通感到後悔，我非常感謝 Sophie 處理事情的溝通方式和處理方法。🙏

像那些走在前面的人一樣，我也發現：面對面的互動總是更好，期待在未來的大會上有更多精彩的對話。🎉