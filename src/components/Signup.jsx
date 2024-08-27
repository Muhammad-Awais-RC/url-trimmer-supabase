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
import { signup } from "@/db/apiAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UrlState } from "@/contexts/context";

const Signup = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		name: "",
		profile_pic: null,
	});
	const [errors, setErrors] = useState({});

	let [searchParams] = useSearchParams();
	const longLink = searchParams.get("createNew");
	const navigate = useNavigate();

	const { loading, error, data, fn: fnSignup } = useFetch(signup, formData);

	function handleInputChange(e) {
		const { name, type, files, value } = e.target;

		if (type === "file" && files && files.length > 0) {
			setFormData((prevState) => ({
				...prevState,
				[name]: files[0],
			}));
		} else {
			setFormData((prevState) => ({
				...prevState,
				[name]: value,
			}));
		}
	}
	async function handleSignup() {
		setErrors([]);
		try {
			const schema = Yup.object().shape({
				name: Yup.string().required("Name is required"),
				email: Yup.string()
					.email("Invalid email")
					.required("Email is required"),
				password: Yup.string()
					.min(6, "Password must be at least 6 characters")
					.required("Password is required"),
				profile_pic: Yup.mixed().required("Profile picture is required"),
			});

			await schema.validate(formData, { abortEarly: false });

			await fnSignup();
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
				<CardTitle>Signup</CardTitle>
				<CardDescription>
					Create a new account if you haven&rsquo;t already
				</CardDescription>
				{error && <Error message={error.message} />}
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="space-y-1">
					<Input
						name="name"
						type="text"
						placeholder="Enter Name"
						onChange={handleInputChange}
					/>
				</div>
				{errors.name && <Error message={errors.name} />}
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
				<div className="space-y-1">
					<Input
						name="profile_pic"
						type="file"
						accept="image/*"
						onChange={handleInputChange}
					/>
				</div>
				{errors.profile_pic && <Error message={errors.profile_pic} />}
			</CardContent>
			<CardFooter>
				<Button onClick={handleSignup}>
					{loading ? (
						<BeatLoader size={10} color="#36d7b7" />
					) : (
						"Create Account"
					)}
				</Button>
			</CardFooter>
		</Card>
	);
};

export default Signup;
