import { BrowserRouter, Routes, Route } from "react-router";
import Play from "./queens/pages/play";
import { StackedLayout } from "./components/stacked-layout";
import { AppNavbar } from "./components/app/navbar";
import { AppSidebar } from "./components/app/sidebar";
import Tutorial from "./queens/pages/tutorial";

export const App = () => {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="queens" element={<StackedLayout navbar={<AppNavbar />} sidebar={<AppSidebar />} />}>
            <Route index element={<Play />} />
            <Route path="tutorial" element={<Tutorial />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
