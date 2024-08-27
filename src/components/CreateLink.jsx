import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UrlState } from "@/contexts/context";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import Error from "./Error";
import { Input } from "./ui/input";
import * as yup from "yup";
import { Card } from "./ui/card";
import { BeatLoader } from "react-spinners";
import { QRCode } from "react-qrcode-logo";
import { createUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/useFetch";
import { Button } from "./ui/button";

const CreateLink = () => {
	const { user } = UrlState();
	const navigate = useNavigate();
	const ref = useRef();
	let [searchParams, setSearchParams] = useSearchParams();
	const longLink = searchParams.get("createNew");

	const [errors, setErrors] = useState({});
	const [formValues, setFormValues] = useState({
		title: "",
		longUrl: longLink ? longLink : "",
		customUrl: "",
	});

	const {
		loading,
		error,
		data,
		fn: fnCreateUrl,
	} = useFetch(createUrl, { ...formValues, user_id: user.id });

	const schema = yup.object().shape({
		title: yup.string().required("Title is required"),
		longUrl: yup
			.string()
			.url("Must be a valid URL")
			.required("Long URL is required"),
		customUrl: yup.string(),
	});

	const handleChange = (e) => {
		setFormValues({
			...formValues,
			[e.target.id]: e.target.value,
		});
	};

	const createNewLink = async () => {
		setErrors([]);
		try {
			await schema.validate(formValues, { abortEarly: false });

			const canvas = ref.current.canvasRef.current;
			const blob = await new Promise((resolve) => canvas.toBlob(resolve));

			await fnCreateUrl(blob);
		} catch (e) {
			const newErrors = {};

			e?.inner?.forEach((err) => {
				newErrors[err.path] = err.message;
			});

			setErrors(newErrors);
		}
	};

	useEffect(() => {
		if (error === null && data) {
			navigate(`/link/${data[0].id}`);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error, data]);

	return (
		<Dialog
			defaultOpen={longLink}
			onOpenChange={(res) => {
				console.log(res);
				if (!res) setSearchParams({});
			}}
		>
			<DialogTrigger asChild>
				<Button variant="destructive">Create New Link</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="font-bold text-2xl">Create New</DialogTitle>
				</DialogHeader>
				{formValues?.longUrl && (
					<QRCode ref={ref} size={250} value={formValues?.longUrl} />
				)}
				<Input
					id="title"
					placeholder="Short Link's Title"
					value={formValues.title}
					onChange={handleChange}
				/>
				{errors.title && <Error message={errors.title} />}
				<Input
					id="longUrl"
					placeholder="Enter your Loooong URL"
					value={formValues.longUrl}
					onChange={handleChange}
				/>
				{errors.longUrl && <Error message={errors.longUrl} />}
				<div className="flex items-center gap-2">
					<Card className="p-2">localhost:5173</Card> /
					<Input
						id="customUrl"
						placeholder="Custom Link (optional)"
						value={formValues.customUrl}
						onChange={handleChange}
					/>
				</div>
				{error && <Error message={errors.message} />}
				<DialogFooter className="sm:justify-start">
					<Button
						type="button"
						variant="destructive"
						onClick={createNewLink}
						disabled={loading?.toString()}
					>
						{loading ? <BeatLoader size={10} color="white" /> : "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CreateLink;
