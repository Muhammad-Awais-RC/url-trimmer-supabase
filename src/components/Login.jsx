/* eslint-disable react-hooks/exhaustive-deps */
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { BeatLoader } from "react-spinners";
import Error from "./Error";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import useFetch from "@/hooks/useFetch";
import { login } from "@/db/apiAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UrlState } from "@/contexts/context";

const Login = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState({});

	let [searchParams] = useSearchParams();
	const longLink = searchParams.get("createNew");
	const navigate = useNavigate();

	const { loading, error, data, fn: fnLogin } = useFetch(login, formData);

	function handleInputChange(e) {
		const { name, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	}
	async function handleLogin() {
		setErrors([]);
		try {
			const schema = Yup.object().shape({
				email: Yup.string()
					.email("Invalid email")
					.required("Email is required"),
				password: Yup.string()
					.min(6, "Password must be at least 6 characters")
					.required("Password is required"),
			});

			await schema.validate(formData, { abortEarly: false });
			await fnLogin();
		} catch (e) {
			const newErrors = {};

			e?.inner?.forEach((err) => {
				newErrors[err.path] = err.message;
			});

			setErrors(newErrors);
		}
	}

	const { fetchUser } = UrlState();

	useEffect(() => {
		console.log(data);
		if (error === null && data) {
			fetchUser();
			navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
		}
	}, [error, data]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Login</CardTitle>
				<CardDescription>
					to your account if you already have one
				</CardDescription>
				{error && <Error message={error.message} />}
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="space-y-1">
					<Input
						name="email"
						type="email"
						placeholder="Enter Email"
						onChange={handleInputChange}
					/>
					{errors.email && <Error message={errors.email} />}
				</div>
				<div className="space-y-1">
					<Input
						name="password"
						type="password"
						placeholder="Enter Password"
						onChange={handleInputChange}
					/>
					{errors.password && <Error message={errors.password} />}
				</div>
			</CardContent>
			<CardFooter>
				<Button onClick={handleLogin}>
					{loading ? <BeatLoader size={10} color="#36d7b7" /> : "Login"}
				</Button>
			</CardFooter>
		</Card>
	);
};

export default Login;
