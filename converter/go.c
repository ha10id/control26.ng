// gcc -o connect connect.c $(pkg-config --cflags --libs libmongoc-1.0)
// gcc -o progname progname.o `mysql_config --libs`
#include <my_global.h>
#include <mysql.h>
#include <bson.h>
#include <bcon.h>
#include <mongoc.h>

void finish_with_error(MYSQL *con)
{
  fprintf(stderr, "%s\n", mysql_error(con));
  mysql_close(con);
  exit(1);
}

int main(int argc, char **argv)
{
  mongoc_client_t *client;
  mongoc_collection_t *collection;
  bson_error_t error;
  bson_oid_t oid;
  bson_t *doc;
  struct tm time;

  mongoc_init ();

  client = mongoc_client_new ("mongodb://localhost:27017/");
  collection = mongoc_client_get_collection (client, "control26", "documents");

  MYSQL *con = mysql_init(NULL);

  if (con == NULL)
  {
      fprintf(stderr, "mysql_init() failed\n");
      exit(1);
  }

	if (!mysql_set_character_set(con, "utf8"))
	{
	    printf("New client character set: %s\n",
	           mysql_character_set_name(con));
	}

  if (mysql_real_connect(con, "localhost", "root", "123025",
          "control26", 0, NULL, 0) == NULL)
  {
      finish_with_error(con);
  }

  // if (mysql_query(con, "SELECT \
  //   title, \
  //   category, \
  //   latitude, \
  //   longitude, \
  //   address, \
  //   description, \
  //   status, \
  //   name \
  //   FROM elise_pcontrol \
  //   where status = 0"))

  if (mysql_query(con, "SELECT \
    d.title, \
    d.category, \
    d.latitude, \
    d.longitude, \
    d.address, \
    d.description, \
    d.status, \
    d.name, \
    h.datestamp \
    FROM elise_pcontrol d \
    JOIN elise_pchistory h ON d.pcid = h.pcid \
    WHERE h.public = 'Сообщение добавлено в систему' AND h.datestamp > '2016-01-01 00:00:01' AND d.status < 2"))
  {
      finish_with_error(con);
  }

  MYSQL_RES *result = mysql_store_result(con);

  if (result == NULL)
  {
      finish_with_error(con);
  }

  int num_fields = mysql_num_fields(result);

  MYSQL_ROW row;
  int row_count = 0;

  while ((row = mysql_fetch_row(result)))
  {
      // for(int i = 0; i < num_fields; i++)
      // {
      //     //  printf("%s ", row[i] ? row[i] : "NULL");
      //     // printf("%d", i);
      // }
          // strptime("2016-05-31 12:20:09", "%F %T", &time);
          // time_t gmttime = timegm(&time);

          printf(" %d | %s | %s | %s | %s |", row_count, row[1], row[2], row[3], row[8]);

          doc = bson_new ();
          bson_oid_init (&oid, NULL);
          BSON_APPEND_OID (doc, "_id", &oid);
          BSON_APPEND_UTF8 (doc, "title", row[0]);
          BSON_APPEND_INT32 (doc, "category_old", atoi(row[1]));
          BSON_APPEND_DOUBLE (doc, "latitude", strtod(row[3], NULL));
          BSON_APPEND_DOUBLE (doc, "longitude", strtod(row[2], NULL));
          BSON_APPEND_UTF8 (doc, "address", row[4]);
          BSON_APPEND_UTF8 (doc, "description", row[5]);
          BSON_APPEND_INT32 (doc, "status", atoi(row[6]));
          BSON_APPEND_UTF8 (doc, "name", row[7]);
          BSON_APPEND_UTF8 (doc, "datestamp", row[8]);
          // BSON_APPEND_TIME_T(doc, "datestamp", row[8]);
          // bson_append_now_utc(doc, "datestamp", -1);

          if (!mongoc_collection_insert (collection, MONGOC_INSERT_NONE, doc, NULL, &error)) {
              fprintf (stderr, "%s\n", error.message);
          }
          bson_destroy (doc);
          printf("\n");
          row_count++;
  }
  printf("rows = %d", row_count);
  mysql_free_result(result);
  mysql_close(con);

  mongoc_collection_destroy (collection);
  mongoc_client_destroy (client);
  mongoc_cleanup ();

  exit(0);
}
