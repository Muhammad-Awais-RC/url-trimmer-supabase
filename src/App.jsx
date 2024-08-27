import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import LinkPage from "./pages/LinkPage";
import RedirectPage from "./pages/RedirectPage";
import UrlProvider from "./contexts/context";
import RequireAuth from "./components/RequireAuth";

const router = createBrowserRouter([
	{
		element: <AppLayout />,
		children: [
			{
				path: "/",
				element: <LandingPage />,
			},
			{
				path: "/auth",
				element: <AuthPage />,
			},
			{
				path: "/dashboard",
				element: (
					<RequireAuth>
						<DashboardPage />
					</RequireAuth>
				),
			},
			{
				path: "/link/:id",
				element: (
					<RequireAuth>
						<LinkPage />
					</RequireAuth>
				),
			},
			{
				path: "/:id",
				element: <RedirectPage />,
			},
		],
	},
]);
function App() {
	return (
		<UrlProvider>
			<RouterProvider router={router} />
		</UrlProvider>
	);
}

export default App;
