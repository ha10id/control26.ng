#include <my_global.h>
#include <mysql.h>

void finish_with_error(MYSQL *con)
{
  fprintf(stderr, "%s\n", mysql_error(con));
  mysql_close(con);
  exit(1);
}

int main(int argc, char **argv)
{
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

  if (mysql_query(con, "SELECT * FROM elise_pcontrol where status < 2 ORDER BY category"))
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

  while ((row = mysql_fetch_row(result)))
  {
      // for(int i = 0; i < num_fields; i++)
      // {
      //     printf("%s ", row[i] ? row[i] : "NULL");
      // }
		printf("| %s | %s | %s | %s |", row[0], row[7], row[5], row[10]);
        printf("\n");
  }

  mysql_free_result(result);
  mysql_close(con);

  exit(0);
}