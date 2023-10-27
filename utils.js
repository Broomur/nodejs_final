/* import { readFile, readFileSync, writeFile } from 'node:fs'; */
import { readFile, writeFile } from 'node:fs/promises';
import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';

const outputDateParser = (dateStr) => {
	const parts = dateStr.split('-').map(Number);
	const year = parts[0];
	const month = parts[2] - 1;
	const day = parts[1];
	return new Date(year, month, day);
}

const inputDateParser = (dateStr) => {
	const parts = dateStr.split('-');
	const year = parts[0];
	const month = dayjs(parts[1], 'MMMM').format('MM');
	const day = parts[2];
	return `${year}-${day}-${month}`;
}

export const getStudents = async () => {
	try {
	  const data = await readFile('./data/students.json', { encoding: 'utf-8' });
	  let students = JSON.parse(data);
  
	  students = students.map((student) => ({
		...student,
		birthString: dayjs(outputDateParser(student.birth)).locale('fr').format('DD/MM/YY'),
		//birthString: dayjs(outputDateParser(student.birth)).locale('fr').format('DD MMMM YYYY'),
	  }));
  
	  return students;
	} catch (err) {
	  throw err;
	}
  };


export const addStudent = async (student) => {
	try {
		let students = [];
		student.birth = inputDateParser(student.birth);
		try {
		  const data = await readFile('./data/students.json', { encoding: 'utf-8' });
		  students = JSON.parse(data);
		} catch (readErr) {
		  if (readErr.code !== 'ENOENT') {
			throw readErr;
		  }
		}
		students.push(student);
		await writeFile('./data/students.json', JSON.stringify(students, null, 2));
		return 'success'
	} catch (err) {
		throw err;
	}
}

export const deleteStudent = async (student) => {
	try {
		let students = [];
		try {
			const data = await readFile('./data/students.json', { encoding: 'utf-8' });
			students = JSON.parse(data);
		} catch (readErr) {
			if (readErr.code !== 'ENOENT') throw readErr;
		}
		students = students.filter((stud) => !(stud.name === student.name && stud.birth === student.birth));
		try {
			await writeFile('./data/students.json', JSON.stringify(students, null, 2));
			return 'success';
		} catch (readErr) {
			if (readErr.code !== 'ENOENT') throw readErr;
		}
	} catch (err) {
		throw err;
	}
}