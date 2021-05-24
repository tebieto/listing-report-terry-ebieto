import { Request, Response } from 'express';
import Report from '../../db/models/report';
import { csvUploadPath } from '../../utils';
import { persistContactsToDatabase } from '../contact';
import { persistListingsToDatabase } from '../listing';

export const persistReport = async (req: Request, res: Response): Promise<void> => {
	try {
		const origin = req.headers.origin;
		const files = req.files as { [fieldname: string]: Express.Multer.File[] };
		const contactsCsv = files['contacts'][0];
		const listingsCsv = files['listings'][0];
		if(contactsCsv && listingsCsv) {
			const listings_csv_name = listingsCsv.filename;
			const contacts_csv_name = contactsCsv.filename;
			const listings_csv_link = `${origin}/${csvUploadPath}/${listingsCsv.filename}`;
			const contacts_csv_link = `${origin}/${csvUploadPath}/${listingsCsv.filename}`;
			const report = await Report.create({ listings_csv_link, contacts_csv_link, listings_csv_name, contacts_csv_name  });
			const report_uuid = report.uuid;
			console.log({ report });
			persistContactsToDatabase(report_uuid, contactsCsv.path);
			persistListingsToDatabase(report_uuid, contactsCsv.path);
			res.status(200).send('Successfully persisted report, contacts and listings');
		}else if(!contactsCsv) {
			res.status(401).send('Contacts CSV(contacts.csv) is required');
		} else if(!listingsCsv) {
			res.status(401).send('Listings CSV(listings.csv) is required');
		}
	} catch(error) {
		console.log(error);
		res.status(401).send(error);
	}
};