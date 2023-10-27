import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import * as querystring from "node:querystring";
import pug from "pug";
import dotenv from "dotenv";
dotenv.config();

import { addStudent, deleteStudent, getStudents } from "./utils.js";

const server = createServer(async (req, res) => {
	const { method, url } = req;
	
	const routes = [
		{ path: "/", title: "Home", isActive: true },
		{ path: "/add-user", title: "Add User", isActive: false },
	];

	if (method === "GET") {
		if (url === "/favicon.ico") {
			res.writeHead(200, {
				"Content-Type": "image/ico",
			});
			res.end();
		} else if (req.url === '/assets/css/bootstrap.min.css') {
			res.writeHead(200, {
				'Content-Type': 'text/css',
			});
			const style = createReadStream('assets/css/bootstrap.min.css', {encoding: 'utf-8'});
			style.pipe(res);
			style.on('end', () => {
				res.end();
			});
		} else if (url === "/") {
			res.writeHead(200, {
				"Content-Type": "text/html",
			});
			const students = await getStudents();
			let title;
			routes.forEach((route) => {
				if (route.path === url) {
					route.isActive = true;
					title = route.title;
				} else route.isActive = false;
			});
			pug.renderFile(
				"./views/pages/home.pug",
				{
					title: title,
					page: req.url,
					navItems: routes,
					students: students,
				},
				(err, html) => {
					if (err) throw err;
					res.end(html);
				}
			);
		} else if (url === "/add-user") {
			res.writeHead(200, {
				"Content-Type": "text/html",
			});
			let title;
			routes.forEach((route) => {
				if (route.path === url) {
					route.isActive = true;
					title = route.title;
				} else route.isActive = false;
			});
			pug.renderFile(
				"./views/pages/add-user.pug",
				{ title: title, page: req.url, navItems: routes },
				(err, html) => {
					if (err) throw err;
					res.end(html);
				}
			);
		} else {
			res.writeHead(404, {
				'Content-Type': 'text/html',
			});
			routes.forEach((route) => {
				route.isActive = false;
			});
			pug.renderFile(
				"./views/pages/404.pug",
				{ title: "404", page: "404", navItems: routes },
				(err, html) => {
					if (err) throw err;
					res.end(html);
				}
			)
		}
	} else if (method === "POST") {
		if (url === "/add-user") {
			try {
				res.writeHead(302, {
					Location: "/",
				});
				let body = "";
				req.on("data", (chunk) => {
					body += chunk;
				});
				req.on("end", async () => {
					const { name, birth } = querystring.parse(body);
					if (name.length > 0 && birth) {
						await addStudent({ name: name, birth: birth });
					}
					res.end();
				});
			} catch (err) {
				console.error(err);
				res.writeHead(302, {
					Location: "/",
				});
				res.end();
			}
		}
	} else if (method === "DELETE") {
		if (url === '/delete-user') {
			try {
				res.writeHead(204);
				let body = "";
				req.on("data", (chunk) => {
					body += chunk;
				});
				req.on("end", async () => {
					body = JSON.parse(body);
					await deleteStudent(body);
					res.end();
				});
			} catch (err) {
				console.error(err);
				res.writeHead(500, {
					"Content-Type": "text/html",
				});
				res.end();
			}
		}
	}
});

if (process.env.APP_ENV === 'development') {
	server.listen(process.env.APP_PORT, () => {
		console.log(
			`listening on ${process.env.APP_LOCALHOST}:${process.env.APP_PORT}`
		);
	});
} else {
	console.log('not ready for production usage, set APP_ENV to development before launching the app :)')
}
